import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

interface DueRow {
  userId: string;
  conversationId: string;
  email: string;
  recipientName: string | null;
  senderName: string | null;
  preview: string;
  unreadCount: number;
}

interface ClaimToken {
  /** Value of lastEmailedAt before we claimed - restored if the send fails. */
  previous: Date | null;
  /** The timestamp we wrote when claiming - used to detect our own claim. */
  claimedAt: Date;
}

const PREVIEW_MAX = 140;
const BATCH_LIMIT = 200;

/**
 * Upwork-style reminder: when a chat message stays unread past a grace window,
 * email the recipient once. Runs as a periodic sweep (not an in-memory timer)
 * so it survives process restarts / redeploys.
 *
 * Eligibility, per conversation participant:
 *   - the newest message from the other side is older than UNREAD_EMAIL_DELAY_MINUTES
 *   - that message is still unread (newer than lastReadAt)
 *   - we have not already emailed since the user last caught up
 *     (lastEmailedAt is null or <= lastReadAt) -> "once per unread streak"
 *   - the user has an email address and has not opted out
 */
@Injectable()
export class UnreadMessagesEmailService {
  private readonly logger = new Logger(UnreadMessagesEmailService.name);
  private running = false;

  private get delayMinutes(): number {
    return parseInt(process.env.UNREAD_EMAIL_DELAY_MINUTES || '5', 10);
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sweep() {
    this.logger.debug('Unread-messages sweep triggered');
    console.log('Unread-messages sweep triggered');
    if (this.running) {
      this.logger.warn('Previous unread-messages sweep still running; skipping');
      console.log('Previous unread-messages sweep still running; skipping');
      return;
    }
    this.running = true;
    try {
      const cutoff = new Date(Date.now() - this.delayMinutes * 60_000);
      this.logger.debug(`Unread-messages sweep cutoff: ${cutoff.toISOString()}`);
      console.log(`Unread-messages sweep cutoff: ${cutoff.toISOString()}`);
      const rows = await this.findDue(cutoff);
      this.logger.debug(`Unread-messages sweep found ${rows.length} due row(s)`);
      console.log(`Unread-messages sweep found ${rows.length} due row(s)`);
      if (rows.length === 0) return;

      let sent = 0;
      let deferred = 0;
      for (const row of rows) {
        const claim = await this.claim(row);
        if (!claim) continue; // lost the race / no longer eligible

        const ok = await this.mail.sendUnreadMessagesEmail({
          to: row.email,
          recipientName: row.recipientName,
          senderName: row.senderName || 'Someone',
          unreadCount: Number(row.unreadCount) || 1,
          preview: row.preview,
          conversationId: row.conversationId,
        });

        if (ok) {
          sent++;
        } else {
          // Send failed (e.g. a transient SMTP error). Undo the claim so a
          // later sweep retries this row instead of silently dropping it.
          await this.releaseClaim(row, claim);
          deferred++;
        }
      }
      const summary = `Unread-messages sweep: ${rows.length} due, ${sent} sent, ${deferred} deferred for retry`;
      this.logger.log(summary);
      console.log(summary);
    } catch (error) {
      this.logger.error(`Unread-messages sweep failed: ${error.message}`);
      console.log(`Unread-messages sweep failed: ${error.message}`);
    } finally {
      this.running = false;
    }
  }

  private async findDue(cutoff: Date): Promise<DueRow[]> {
    const rows = await this.prisma.$queryRaw<DueRow[]>`
      SELECT
        cp."userId"          AS "userId",
        cp."conversationId"  AS "conversationId",
        u."email"            AS "email",
        u."name"             AS "recipientName",
        s."name"             AS "senderName",
        LEFT(latest."body", ${Prisma.raw(String(PREVIEW_MAX))}) AS "preview",
        (
          SELECT COUNT(*)::int FROM "Message" m2
          WHERE m2."conversationId" = cp."conversationId"
            AND m2."senderId" <> cp."userId"
            AND m2."createdAt" > COALESCE(cp."lastReadAt", TIMESTAMP 'epoch')
        ) AS "unreadCount"
      FROM "ConversationParticipant" cp
      JOIN "User" u ON u."id" = cp."userId"
      JOIN LATERAL (
        SELECT m."body", m."createdAt", m."senderId"
        FROM "Message" m
        WHERE m."conversationId" = cp."conversationId"
          AND m."senderId" <> cp."userId"
        ORDER BY m."createdAt" DESC
        LIMIT 1
      ) latest ON TRUE
      JOIN "User" s ON s."id" = latest."senderId"
      WHERE u."email" IS NOT NULL
        AND u."emailOnUnreadMessages" = TRUE
        AND latest."createdAt" <= ${cutoff}
        AND latest."createdAt" > COALESCE(cp."lastReadAt", TIMESTAMP 'epoch')
        AND (
          cp."lastEmailedAt" IS NULL
          OR cp."lastEmailedAt" <= COALESCE(cp."lastReadAt", TIMESTAMP 'epoch')
        )
      LIMIT ${Prisma.raw(String(BATCH_LIMIT))}
    `;
    return rows;
  }

  /**
   * Atomically mark the reminder as sent. Re-checks eligibility in the WHERE so
   * a concurrent sweep (or a read that landed between findDue and here) cannot
   * double-send. Returns a claim token (the row's previous and newly written
   * `lastEmailedAt`) iff this call is the one that claimed the row, else null.
   * The token lets the caller undo the claim if the email then fails to send.
   */
  private async claim(row: DueRow): Promise<ClaimToken | null> {
    const claimedAt = new Date();

    const [current] = await this.prisma.$queryRaw<
      { lastEmailedAt: Date | null }[]
    >`
      SELECT "lastEmailedAt"
      FROM "ConversationParticipant"
      WHERE "conversationId" = ${row.conversationId}
        AND "userId" = ${row.userId}
    `;
    const previous = current?.lastEmailedAt ?? null;

    const affected = await this.prisma.$executeRaw`
      UPDATE "ConversationParticipant"
      SET "lastEmailedAt" = ${claimedAt}
      WHERE "conversationId" = ${row.conversationId}
        AND "userId" = ${row.userId}
        AND (
          "lastEmailedAt" IS NULL
          OR "lastEmailedAt" <= COALESCE("lastReadAt", TIMESTAMP 'epoch')
        )
    `;

    return affected === 1 ? { previous, claimedAt } : null;
  }

  /**
   * Undo a claim whose email failed to send, so a later sweep picks the row up
   * again. Guarded on the exact timestamp we wrote, so a claim/read written by
   * another sweep in the meantime is never clobbered.
   */
  private async releaseClaim(row: DueRow, claim: ClaimToken): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "ConversationParticipant"
      SET "lastEmailedAt" = ${claim.previous}
      WHERE "conversationId" = ${row.conversationId}
        AND "userId" = ${row.userId}
        AND "lastEmailedAt" = ${claim.claimedAt}
    `;
  }
}

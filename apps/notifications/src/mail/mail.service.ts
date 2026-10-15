import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface UnreadMessagesEmailInput {
  to: string;
  recipientName?: string | null;
  senderName: string;
  unreadCount: number;
  preview: string;
  conversationId: string;
}

/**
 * Thin wrapper around a nodemailer SMTP transport. Mirrors the transport
 * configuration used by the API gateway's contact-requests controller so the
 * two stay in sync; the notifications service needs its own copy because it
 * runs as a separate process (and, on Railway, a separate service that must be
 * given the SMTP_* env vars).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'dummy@gmail.com',
      pass: process.env.SMTP_PASS || 'dummy',
    },
  });

  private get from() {
    return process.env.SMTP_FROM || process.env.SMTP_USER || '"ShinApp" <noreply@shinapp.com>';
  }

  private get appUrl() {
    return (process.env.APP_URL || 'https://shinapp.am').replace(/\/$/, '');
  }

  async sendUnreadMessagesEmail(input: UnreadMessagesEmailInput) {
    const conversationUrl = `${this.appUrl}/messages/${input.conversationId}`;
    const countLabel =
      input.unreadCount > 1
        ? `${input.unreadCount} unread messages`
        : 'a new message';
    const subject =
      input.unreadCount > 1
        ? `You have ${input.unreadCount} unread messages from ${input.senderName}`
        : `New message from ${input.senderName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="margin-bottom: 4px;">${escapeHtml(input.senderName)} sent you ${countLabel}</h2>
        <p style="color: #555;">Hello ${escapeHtml(input.recipientName || '')},</p>
        <blockquote style="margin: 16px 0; padding: 12px 16px; background: #f5f5f5; border-left: 3px solid #ccc; white-space: pre-wrap;">${escapeHtml(
          input.preview,
        )}</blockquote>
        <p>
          <a href="${conversationUrl}"
             style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
            Open conversation
          </a>
        </p>
        <p style="margin-top: 24px; font-size: 0.85em; color: #777;">
          You are receiving this because you have unread messages on ShinApp.
          You can turn these reminders off in your notification settings.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send unread-messages email to ${input.to}: ${error.message}`,
      );
      return false;
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

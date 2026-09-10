import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationType, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Orders in these statuses are still "in progress" as far as the master is
// concerned - PENDING never got accepted so there is no contract to be late
// on, and REJECTED/CANCELLED/COMPLETED are already resolved.
const OVERDUE_ELIGIBLE_STATUSES: OrderStatus[] = [OrderStatus.ACCEPTED, OrderStatus.COMPLETION_REQUESTED];

/**
 * Periodic sweep (not an in-memory timer, so it survives restarts/redeploys):
 * once an order's endDate passes while it is still not COMPLETED, notify the
 * master once. `overdueNotifiedAt` makes this idempotent across sweeps.
 */
@Injectable()
export class OverdueOrdersService {
  private readonly logger = new Logger(OverdueOrdersService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsService: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async sweep() {
    if (this.running) {
      this.logger.warn('Previous overdue-orders sweep still running; skipping');
      return;
    }
    this.running = true;
    try {
      const now = new Date();
      const due = await this.prisma.order.findMany({
        where: {
          endDate: { lt: now },
          status: { in: OVERDUE_ELIGIBLE_STATUSES },
          overdueNotifiedAt: null,
        },
        select: { id: true, masterId: true },
      });
      if (due.length === 0) return;

      let notified = 0;
      for (const order of due) {
        // Atomic claim: only the sweep that flips overdueNotifiedAt from null
        // sends the notification, so a concurrent/overlapping run can't double-send.
        const claimed = await this.prisma.order.updateMany({
          where: { id: order.id, overdueNotifiedAt: null },
          data: { overdueNotifiedAt: now },
        });
        if (claimed.count === 0) continue;

        this.notificationsService.emit(
          { cmd: 'create-notification' },
          {
            userId: order.masterId,
            type: NotificationType.ORDER_OVERDUE,
            title: 'Order Overdue',
            message: 'The scheduled end date for one of your orders has passed and it is not yet marked as completed.',
            metadata: {
              orderId: order.id,
              i18n: {
                titleKey: 'notif_order_overdue_title',
                messageKey: 'notif_order_overdue_message',
                params: {},
              },
            },
          },
        );
        notified++;
      }
      this.logger.log(`Overdue-orders sweep: ${due.length} due, ${notified} notified`);
    } catch (error) {
      this.logger.error(`Overdue-orders sweep failed: ${error.message}`);
    } finally {
      this.running = false;
    }
  }
}

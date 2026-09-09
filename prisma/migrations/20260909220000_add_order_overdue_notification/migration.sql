-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ORDER_OVERDUE';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "overdueNotifiedAt" TIMESTAMP(3);

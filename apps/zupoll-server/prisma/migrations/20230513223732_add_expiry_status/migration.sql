-- CreateEnum
CREATE TYPE "ExpiryNotifStatus" AS ENUM ('NONE', 'WEEK', 'DAY', 'HOUR');

-- AlterTable
ALTER TABLE "Ballot" ADD COLUMN     "expiryNotif" "ExpiryNotifStatus" DEFAULT 'NONE';

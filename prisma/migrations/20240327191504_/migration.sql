/*
  Warnings:

  - You are about to drop the column `feed` on the `feed` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `feed` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `feed` table. All the data in the column will be lost.
  - You are about to alter the column `unitPrice` on the `feed` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - Added the required column `name` to the `Feed` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `feed` DROP FOREIGN KEY `Feed_requestId_fkey`;

-- AlterTable
ALTER TABLE `feed` DROP COLUMN `feed`,
    DROP COLUMN `quantity`,
    DROP COLUMN `requestId`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `unitPrice` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `loanrequest` MODIFY `status` ENUM('Pending', 'Aproved', 'Rejected') NOT NULL DEFAULT 'Pending';

-- CreateTable
CREATE TABLE `FeedLoan` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `feedId` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(65, 30) NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FeedLoan` ADD CONSTRAINT `FeedLoan_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `LoanRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedLoan` ADD CONSTRAINT `FeedLoan_feedId_fkey` FOREIGN KEY (`feedId`) REFERENCES `Feed`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

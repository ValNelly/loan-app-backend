/*
  Warnings:

  - A unique constraint covering the columns `[amount]` on the table `Loan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Loan_amount_key` ON `Loan`(`amount`);

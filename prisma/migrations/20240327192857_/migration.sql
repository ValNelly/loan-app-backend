/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Feed` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Feed_name_key` ON `Feed`(`name`);

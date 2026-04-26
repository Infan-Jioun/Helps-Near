/*
  Warnings:

  - Added the required column `fee` to the `volunteer_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "volunteer_profile" ADD COLUMN     "fee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false;

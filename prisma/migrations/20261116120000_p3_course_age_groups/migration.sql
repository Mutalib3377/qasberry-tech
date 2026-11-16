-- Phase 3 (UX gaps #02): age bands on courses.
-- Purely additive: a new enum and one new column on "courses". The default
-- tags every existing course with all three bands, so nothing disappears
-- from age-filtered views until an admin narrows a course down.

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('AGES_6_9', 'AGES_10_12', 'AGES_13_16');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "ageGroups" "AgeGroup"[] DEFAULT ARRAY['AGES_6_9', 'AGES_10_12', 'AGES_13_16']::"AgeGroup"[];

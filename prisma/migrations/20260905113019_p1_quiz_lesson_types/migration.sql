-- P1: Database / Data Model — Qasberry Learning Overhaul
-- Purely additive. Every existing column, table, index, and enum value is left
-- untouched. No existing row is modified: new columns land with backward-compatible
-- defaults (type='VIDEO', isRequired=true, isFinalAssessment=false), matching the
-- product's current implicit behavior exactly. videoUrl / pdfUrl / muxAssetId /
-- muxPlaybackId / duration on "lessons" are not touched — they remain the permanent
-- Google Drive / legacy fallback.

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'READING', 'QUIZ');

-- AlterTable: certificates
ALTER TABLE "certificates" ADD COLUMN     "finalScore" INTEGER;

-- AlterTable: lessons
ALTER TABLE "lessons" ADD COLUMN     "content" TEXT,
ADD COLUMN     "documentKey" TEXT,
ADD COLUMN     "isFinalAssessment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quizId" TEXT,
ADD COLUMN     "type" "LessonType" NOT NULL DEFAULT 'VIDEO';

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "passingScore" INTEGER NOT NULL,
    "maxAttempts" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "questions_quizId_idx" ON "questions"("quizId");

-- CreateIndex
CREATE INDEX "options_questionId_idx" ON "options"("questionId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_quizId_idx" ON "quiz_attempts"("userId", "quizId");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_passed_score_idx" ON "quiz_attempts"("quizId", "passed", "score");

-- CreateIndex
CREATE INDEX "quiz_answers_attemptId_idx" ON "quiz_answers"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_quizId_key" ON "lessons"("quizId");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────
-- Safety net: at most one final-assessment lesson per course.
--
-- Not expressible as a Prisma @@unique because it spans lessons -> modules ->
-- courses. This trigger is a no-op today — every course currently has zero
-- lessons with isFinalAssessment = true — it only starts mattering once P4/P7
-- begin writing isFinalAssessment = true from the admin quiz builder.
--
-- Table/column names below match this schema's actual @@map'd names (lower
-- snake_case tables: "lessons", "modules"; camelCase columns), verified
-- against prisma/migrations/20260417214601_init/migration.sql — NOT the
-- PascalCase Prisma model names.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION enforce_single_final_assessment()
RETURNS TRIGGER AS $$
DECLARE
  target_course_id TEXT;
  conflict_count INTEGER;
BEGIN
  IF NEW."isFinalAssessment" IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  SELECT m."courseId" INTO target_course_id
  FROM "modules" m
  WHERE m."id" = NEW."moduleId";

  SELECT COUNT(*) INTO conflict_count
  FROM "lessons" l
  JOIN "modules" m ON m."id" = l."moduleId"
  WHERE m."courseId" = target_course_id
    AND l."isFinalAssessment" = true
    AND l."id" != NEW."id";

  IF conflict_count > 0 THEN
    RAISE EXCEPTION
      'Course % already has a final-assessment lesson. Unset the existing one before flagging another.',
      target_course_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_single_final_assessment ON "lessons";

CREATE TRIGGER trg_enforce_single_final_assessment
  BEFORE INSERT OR UPDATE OF "isFinalAssessment", "moduleId" ON "lessons"
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_final_assessment();

ALTER TABLE "Term"
ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Term_sessionId_isCurrent_idx"
ON "Term"("sessionId", "isCurrent");

CREATE UNIQUE INDEX "Term_one_current_per_session_idx"
ON "Term"("sessionId")
WHERE "isCurrent" = true;

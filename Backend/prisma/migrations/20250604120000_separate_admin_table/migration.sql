-- Separate admin accounts from customer users.

CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "passwordHash" TEXT NOT NULL,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "profileNote" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

INSERT INTO "Admin" (
    "id",
    "fullName",
    "email",
    "phone",
    "passwordHash",
    "tokenVersion",
    "profileNote",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "fullName",
    "email",
    "phone",
    COALESCE("passwordHash", ''),
    "tokenVersion",
    "profileNote",
    "createdAt",
    "updatedAt"
FROM "User"
WHERE "role" = 'admin';

ALTER TABLE "AdminRefreshToken" ADD COLUMN "adminId" TEXT;

UPDATE "AdminRefreshToken" AS art
SET "adminId" = u."id"
FROM "User" AS u
WHERE art."userId" = u."id" AND u."role" = 'admin';

DELETE FROM "AdminRefreshToken" WHERE "adminId" IS NULL;

ALTER TABLE "AdminRefreshToken" DROP CONSTRAINT IF EXISTS "AdminRefreshToken_userId_fkey";
ALTER TABLE "AdminRefreshToken" DROP COLUMN "userId";

ALTER TABLE "AdminRefreshToken"
ADD CONSTRAINT "AdminRefreshToken_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "AdminRefreshToken_adminId_idx" ON "AdminRefreshToken"("adminId");

DELETE FROM "User" WHERE "role" = 'admin';

ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" DROP COLUMN "tokenVersion";

DROP TYPE "UserRole";

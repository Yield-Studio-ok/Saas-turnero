-- CreateTable
CREATE TABLE "legal_notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "target_user_role" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_notice_acceptances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "legal_notice_id" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_notice_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_notice_acceptances_user_id_legal_notice_id_key" ON "legal_notice_acceptances"("user_id", "legal_notice_id");

-- AddForeignKey
ALTER TABLE "legal_notice_acceptances" ADD CONSTRAINT "legal_notice_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_notice_acceptances" ADD CONSTRAINT "legal_notice_acceptances_legal_notice_id_fkey" FOREIGN KEY ("legal_notice_id") REFERENCES "legal_notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

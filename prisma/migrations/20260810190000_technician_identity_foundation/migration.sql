CREATE TABLE "public"."technician_sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicianId" TEXT NOT NULL,
    CONSTRAINT "technician_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "technician_sessions_tokenHash_key" ON "public"."technician_sessions"("tokenHash");
CREATE INDEX "technician_sessions_technicianId_expiresAt_idx" ON "public"."technician_sessions"("technicianId", "expiresAt");

ALTER TABLE "public"."technician_sessions" ADD CONSTRAINT "technician_sessions_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."technician_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

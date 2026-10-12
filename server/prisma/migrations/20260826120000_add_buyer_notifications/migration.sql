CREATE TABLE "BuyerNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BuyerNotification_userId_idx" ON "BuyerNotification"("userId");
CREATE INDEX "BuyerNotification_isRead_idx" ON "BuyerNotification"("isRead");

ALTER TABLE "BuyerNotification" ADD CONSTRAINT "BuyerNotification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

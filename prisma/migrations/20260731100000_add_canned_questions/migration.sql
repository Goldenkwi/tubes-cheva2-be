-- CreateTable
CREATE TABLE "CannedQuestion" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CannedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CannedQuestionHistory" (
    "id" SERIAL NOT NULL,
    "cannedQuestionId" INTEGER,
    "userId" INTEGER,
    "customerId" INTEGER,
    "orderId" INTEGER,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "userIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CannedQuestionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CannedQuestion_category_isActive_idx" ON "CannedQuestion"("category", "isActive");

-- CreateIndex
CREATE INDEX "CannedQuestionHistory_userId_createdAt_idx" ON "CannedQuestionHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CannedQuestionHistory_cannedQuestionId_idx" ON "CannedQuestionHistory"("cannedQuestionId");

-- CreateIndex
CREATE INDEX "CannedQuestionHistory_customerId_idx" ON "CannedQuestionHistory"("customerId");

-- AddForeignKey
ALTER TABLE "CannedQuestionHistory" ADD CONSTRAINT "CannedQuestionHistory_cannedQuestionId_fkey" FOREIGN KEY ("cannedQuestionId") REFERENCES "CannedQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CannedQuestionHistory" ADD CONSTRAINT "CannedQuestionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CannedQuestionHistory" ADD CONSTRAINT "CannedQuestionHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CannedQuestionHistory" ADD CONSTRAINT "CannedQuestionHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

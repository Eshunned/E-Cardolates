-- CreateTable
CREATE TABLE "public"."Card" (
    "id" TEXT NOT NULL,
    "to" VARCHAR(200) NOT NULL,
    "from" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

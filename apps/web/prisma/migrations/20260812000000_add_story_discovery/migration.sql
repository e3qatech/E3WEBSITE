-- CreateTable
CREATE TABLE "StoryType" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "icon" TEXT,
    "coverMediaUrl" TEXT,
    "coverMediaType" TEXT NOT NULL DEFAULT 'IMAGE',
    "accentColor" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttractionFeature" (
    "id" TEXT NOT NULL,
    "attractionId" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "imageUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttractionFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AttractionFeatureToStoryType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StoryType_slug_key" ON "StoryType"("slug");

-- CreateIndex
CREATE INDEX "StoryType_isActive_idx" ON "StoryType"("isActive");

-- CreateIndex
CREATE INDEX "AttractionFeature_attractionId_idx" ON "AttractionFeature"("attractionId");

-- CreateIndex
CREATE UNIQUE INDEX "_AttractionFeatureToStoryType_AB_unique" ON "_AttractionFeatureToStoryType"("A", "B");

-- CreateIndex
CREATE INDEX "_AttractionFeatureToStoryType_B_index" ON "_AttractionFeatureToStoryType"("B");

-- AddForeignKey
ALTER TABLE "AttractionFeature" ADD CONSTRAINT "AttractionFeature_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttractionFeatureToStoryType" ADD CONSTRAINT "_AttractionFeatureToStoryType_A_fkey" FOREIGN KEY ("A") REFERENCES "AttractionFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttractionFeatureToStoryType" ADD CONSTRAINT "_AttractionFeatureToStoryType_B_fkey" FOREIGN KEY ("B") REFERENCES "StoryType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

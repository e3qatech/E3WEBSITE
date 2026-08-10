"use client";

import React, { useEffect, useState } from 'react';
import { useAttractionsStore, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { useB2CTheme } from '@/components/ui/B2CThemeComponents';

// Master Narrative Story Components
import { CinematicHeroUniversal } from '@/components/b2c/story/CinematicHeroUniversal';
import { IdeasToLifeComparison } from '@/components/b2c/story/IdeasToLifeComparison';
import { StoryTaxonomyPortals } from '@/components/b2c/story/StoryTaxonomyPortals';
import { ExperienceWorldsStage } from '@/components/b2c/story/ExperienceWorldsStage';
import { Act4LivingDayTimeline } from '@/components/b2c/story/Act4LivingDayTimeline';
import { QatarInteractiveMap } from '@/components/b2c/story/QatarInteractiveMap';
import { HorizontalGPUParallaxGallery } from '@/components/b2c/story/HorizontalGPUParallaxGallery';
import { TactileDigitalTicket } from '@/components/b2c/story/TactileDigitalTicket';
import { StoryTrailControl } from '@/components/b2c/story/StoryTrailControl';

export function AttractionsClient({
  locale,
  cmsData,
  initialAttractions = []
}: {
  locale: string;
  cmsData: any;
  initialAttractions?: Attraction[];
}) {
  useLiveOccupancy();
  const { isAr } = useB2CTheme();

  const {
    attractions,
    setAttractions,
  } = useAttractionsStore();

  const [filteredCategory, setFilteredCategory] = useState<string | null>(null);

  useEffect(() => {
    if (initialAttractions.length > 0) {
      setAttractions(initialAttractions);
    } else {
      const fetchAttractions = async () => {
        try {
          const res = await fetch('/api/attractions?isPublished=true&limit=50');
          const json = await res.json();
          if (json.data) {
            setAttractions(json.data);
          }
        } catch (error) {
          console.error("Failed to fetch attractions", error);
        }
      };
      fetchAttractions();
    }
  }, [setAttractions, initialAttractions]);

  return (
    <div className="relative min-h-screen bg-[#05020c] text-white selection:bg-purple-500 selection:text-white">
      {/* 1. Cinematic Hero Section */}
      <CinematicHeroUniversal content={cmsData} locale={locale} />

      {/* 2. From Idea to Reality (Ideas to Life) */}
      <IdeasToLifeComparison content={cmsData} locale={locale} />

      {/* 3. Story Discovery Taxonomy ("What kind of story do you want today?") */}
      <StoryTaxonomyPortals
        content={cmsData}
        locale={locale}
        onSelectCategory={(cat) => setFilteredCategory(cat)}
      />

      {/* 4. Enter the Experience Worlds */}
      <ExperienceWorldsStage content={cmsData} locale={locale} />

      {/* 5. Live Today Timeline */}
      <Act4LivingDayTimeline content={cmsData} locale={locale} />

      {/* 6. Explore E3 Across Qatar & Near Me Geolocation */}
      <QatarInteractiveMap content={cmsData} locale={locale} />

      {/* 7. The Moment Becomes a Memory (GPU Parallax Gallery) */}
      <HorizontalGPUParallaxGallery content={cmsData} locale={locale} />

      {/* 8. Final Booking Transformation (Tactile Ticket) */}
      <TactileDigitalTicket content={cmsData} locale={locale} />

      {/* Persistent Story Trail Journey Indicator */}
      <StoryTrailControl
        currentStoryLabelEn="Drive"
        currentStoryLabelAr="قيادة"
        currentWorldNameEn="Kids City Driving School"
        currentWorldNameAr="مدينة قيادة الأطفال"
        locale={locale}
      />
    </div>
  );
}

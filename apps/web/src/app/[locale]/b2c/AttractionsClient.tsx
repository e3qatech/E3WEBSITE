"use client";

import React, { useEffect, useState } from 'react';
import { useAttractionsStore, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { useB2CTheme } from '@/components/ui/B2CThemeComponents';
import { usePointerIntent } from '@/lib/usePointerIntent';

// Master Narrative Story Components
import { CinematicHeroUniversal } from '@/components/b2c/story/CinematicHeroUniversal';
import { IdeasToLifeComparison } from '@/components/b2c/story/IdeasToLifeComparison';
import { StoryTaxonomyPortals } from '@/components/b2c/story/StoryTaxonomyPortals';
import { ExperienceWorldsStage } from '@/components/b2c/story/ExperienceWorldsStage';
import { Act4LivingDayTimeline } from '@/components/b2c/story/Act4LivingDayTimeline';
import { QatarInteractiveMap } from '@/components/b2c/story/QatarInteractiveMap';
import { OurBrandsConstellation } from '@/components/b2c/story/OurBrandsConstellation';
import { CoreTeamPeopleSection } from '@/components/b2c/story/CoreTeamPeopleSection';
import { SocialFeedSection } from '@/components/b2c/story/SocialFeedSection';
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
  usePointerIntent();
  const { isAr: _isAr } = useB2CTheme();
  const [liveCmsContent, setLiveCmsContent] = useState(cmsData);

  const {
    attractions: _attractions,
    setAttractions,
  } = useAttractionsStore();

  const [_filteredCategory, setFilteredCategory] = useState<string | null>(null);

  useEffect(() => {
    if (cmsData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveCmsContent(cmsData);
    }
  }, [cmsData]);

  useEffect(() => {
    const fetchLatestCMS = async () => {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.content) {
            setLiveCmsContent(json.data.content);
          }
        }
      } catch (_e) {}
    };

    window.addEventListener('e3_cms_b2c_landing_updated', fetchLatestCMS);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('e3_cms_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'b2c_landing_updated') {
          fetchLatestCMS();
        }
      };
    } catch (_e) {}

    return () => {
      window.removeEventListener('e3_cms_b2c_landing_updated', fetchLatestCMS);
      if (bc) bc.close();
    };
  }, []);

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
      {/* 1. Cinematic Universal Hero */}
      <CinematicHeroUniversal content={liveCmsContent} locale={locale} />

      {/* 2. From Idea to Reality (Ideas to Life) */}
      <IdeasToLifeComparison content={liveCmsContent} locale={locale} />

      {/* 3. Story Discovery Taxonomy ("What kind of story do you want today?") */}
      <StoryTaxonomyPortals
        content={liveCmsContent}
        locale={locale}
        onSelectCategory={(cat) => setFilteredCategory(cat)}
      />

      {/* 4. Worlds Created by E3 (Our Brands Constellation) */}
      <OurBrandsConstellation content={liveCmsContent} locale={locale} />

      {/* 5. Enter the Experience Worlds */}
      <ExperienceWorldsStage content={liveCmsContent} locale={locale} />

      {/* 6. The People Behind the Experience (Core Team) */}
      <CoreTeamPeopleSection content={liveCmsContent} locale={locale} />

      {/* 7. Live Today Timeline */}
      <Act4LivingDayTimeline content={liveCmsContent} locale={locale} />

      {/* 8. Explore E3 Across Qatar & Near Me Geolocation */}
      <QatarInteractiveMap content={liveCmsContent} locale={locale} />

      {/* 9. E3 Happening Now (Social Feed) */}
      <SocialFeedSection content={liveCmsContent} locale={locale} />

      {/* 10. The Moment Becomes a Memory (GPU Parallax Gallery) */}
      <HorizontalGPUParallaxGallery content={liveCmsContent} locale={locale} />

      {/* 11. Final Booking Transformation (Tactile Ticket) */}
      <TactileDigitalTicket content={liveCmsContent} locale={locale} />

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

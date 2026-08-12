"use client";

import React, { useEffect, useState } from 'react';
import { useAttractionsStore, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { useB2CTheme } from '@/components/ui/B2CThemeComponents';
import { usePointerIntent } from '@/lib/usePointerIntent';

// Master Narrative Story Components for B2C Landing Page
import { CinematicHeroUniversal } from '@/components/b2c/story/CinematicHeroUniversal';
import { IdeasToLifeComparison } from '@/components/b2c/story/IdeasToLifeComparison';
import { StoryTaxonomyPortals } from '@/components/b2c/story/StoryTaxonomyPortals';
import { OurBrandsConstellation } from '@/components/b2c/story/OurBrandsConstellation';
import { ExperienceWorldsStage } from '@/components/b2c/story/ExperienceWorldsStage';
import { CoreTeamPeopleSection } from '@/components/b2c/story/CoreTeamPeopleSection';
import { Act4LivingDayTimeline } from '@/components/b2c/story/Act4LivingDayTimeline';
import { QatarInteractiveMap } from '@/components/b2c/story/QatarInteractiveMap';
import { SocialFeedSection } from '@/components/b2c/story/SocialFeedSection';
import { HorizontalGPUParallaxGallery } from '@/components/b2c/story/HorizontalGPUParallaxGallery';
import { TactileDigitalTicket } from '@/components/b2c/story/TactileDigitalTicket';
import { StoryTrailControl } from '@/components/b2c/story/StoryTrailControl';

interface B2CLandingClientProps {
  locale: string;
  cmsData: any;
  initialAttractions?: Attraction[];
}

export function B2CLandingClient({
  locale,
  cmsData,
  initialAttractions = []
}: B2CLandingClientProps) {
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
      setLiveCmsContent(cmsData);
    }
  }, [cmsData]);

  useEffect(() => {
    let abortController = new AbortController();

    const fetchLatestCMS = async () => {
      abortController.abort();
      abortController = new AbortController();

      try {
        const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { 
          cache: 'no-store',
          signal: abortController.signal
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.content) {
            setLiveCmsContent(json.data.content);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch CMS updates', err);
        }
      }
    };

    fetchLatestCMS();

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
      abortController.abort();
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
      {/* 1. HERO SECTION */}
      <CinematicHeroUniversal content={liveCmsContent} locale={locale} />

      {/* 2. IDEAS TO LIFE */}
      <IdeasToLifeComparison content={liveCmsContent} locale={locale} />

      {/* 3. STORY DISCOVERY */}
      <StoryTaxonomyPortals
        content={liveCmsContent}
        locale={locale}
        onSelectCategory={(cat) => setFilteredCategory(cat)}
      />

      {/* 4. OUR BRANDS — CREATED BY E3 */}
      <OurBrandsConstellation content={liveCmsContent} locale={locale} />

      {/* 5. E3 FEATURED ATTRACTION WORLDS */}
      <ExperienceWorldsStage content={liveCmsContent} locale={locale} />

      {/* 6. CORE TEAM — HUMAN PROOF */}
      <CoreTeamPeopleSection content={liveCmsContent} locale={locale} />

      {/* 7. THE LIVING DAY */}
      <Act4LivingDayTimeline content={liveCmsContent} locale={locale} />

      {/* 8. EXPLORE E3 ACROSS QATAR */}
      <QatarInteractiveMap content={liveCmsContent} locale={locale} />

      {/* 9. E3 HAPPENING NOW — LIVE FEED */}
      <SocialFeedSection content={liveCmsContent} locale={locale} />

      {/* 10. EVERLASTING MEMORIE */}
      <HorizontalGPUParallaxGallery content={liveCmsContent} locale={locale} />

      {/* 11. MAKE TODAY THE STORY */}
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

"use client";

import React, { useEffect, useState } from 'react';
import { useAttractionsStore, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { useB2CTheme } from '@/components/ui/B2CThemeComponents';
import { usePointerIntent } from '@/lib/usePointerIntent';

import { DEFAULT_B2C_SECTION_SEQUENCE, B2CSectionItem } from '@/lib/cms-default-pages';
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

  const rawSeq = liveCmsContent?.sectionSequence || liveCmsContent?.sequence;
  const sectionSequence: B2CSectionItem[] = Array.isArray(rawSeq) && rawSeq.length > 0
    ? rawSeq
    : DEFAULT_B2C_SECTION_SEQUENCE;

  const activeSections = sectionSequence
    .filter(sec => sec && sec.enabled !== false && (sec as any).isVisible !== false);

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <CinematicHeroUniversal key="hero" content={liveCmsContent} locale={locale} />;
      case 'ideasToLife':
        return <IdeasToLifeComparison key="ideasToLife" content={liveCmsContent} locale={locale} />;
      case 'storyDiscovery':
        return (
          <StoryTaxonomyPortals
            key="storyDiscovery"
            content={liveCmsContent}
            locale={locale}
            onSelectCategory={(cat) => setFilteredCategory(cat)}
          />
        );
      case 'ourBrands':
        return <OurBrandsConstellation key="ourBrands" content={liveCmsContent} locale={locale} />;
      case 'experienceWorlds':
        return <ExperienceWorldsStage key="experienceWorlds" content={liveCmsContent} locale={locale} />;
      case 'coreTeam':
        return <CoreTeamPeopleSection key="coreTeam" content={liveCmsContent} locale={locale} />;
      case 'livingDay':
        return <Act4LivingDayTimeline key="livingDay" content={liveCmsContent} locale={locale} />;
      case 'qatarMap':
        return <QatarInteractiveMap key="qatarMap" content={liveCmsContent} locale={locale} />;
      case 'socialFeed':
        return <SocialFeedSection key="socialFeed" content={liveCmsContent} locale={locale} />;
      case 'parallaxGallery':
        return <HorizontalGPUParallaxGallery key="parallaxGallery" content={liveCmsContent} locale={locale} />;
      case 'digitalTicket':
        return <TactileDigitalTicket key="digitalTicket" content={liveCmsContent} locale={locale} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] selection:bg-purple-500 selection:text-white">
      {activeSections.map((sec) => renderSection(sec.id))}

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

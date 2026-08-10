"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAttractionsStore, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { useB2CTheme } from '@/components/ui/B2CThemeComponents';

// Act Narrative Components
import { Act1ImagineIt } from '@/components/b2c/story/Act1ImagineIt';
import { Act2BringItToLife } from '@/components/b2c/story/Act2BringItToLife';
import { Act3AttractionWorlds } from '@/components/b2c/story/Act3AttractionWorlds';
import { IntentSelectorDoorways } from '@/components/b2c/story/IntentSelectorDoorways';
import { Act4LivingDayTimeline } from '@/components/b2c/story/Act4LivingDayTimeline';
import { Act5QatarRouteMap } from '@/components/b2c/story/Act5QatarRouteMap';
import { Act6GuestMemoryRibbon } from '@/components/b2c/story/Act6GuestMemoryRibbon';
import { Act7TactileTicketScene } from '@/components/b2c/story/Act7TactileTicketScene';

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
      {/* Act I — Imagine It */}
      <Act1ImagineIt content={cmsData} locale={locale} />

      {/* Act II — Bring It to Life */}
      <Act2BringItToLife content={cmsData} locale={locale} />

      {/* Act III — Enter the Worlds */}
      <Act3AttractionWorlds content={cmsData} locale={locale} />

      {/* Story Intent Selector Doorways */}
      <IntentSelectorDoorways
        content={cmsData}
        locale={locale}
        onSelectCategory={(cat) => setFilteredCategory(cat)}
      />

      {/* Act IV — The Living Day Timeline */}
      <Act4LivingDayTimeline content={cmsData} locale={locale} />

      {/* Act V — A Journey Across Qatar */}
      <Act5QatarRouteMap content={cmsData} locale={locale} />

      {/* Act VI — The Moment Becomes a Memory */}
      <Act6GuestMemoryRibbon content={cmsData} locale={locale} />

      {/* Act VII — Final Scene: Make Today the Story */}
      <Act7TactileTicketScene content={cmsData} locale={locale} />
    </div>
  );
}

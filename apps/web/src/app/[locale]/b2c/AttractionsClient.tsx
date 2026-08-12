"use client";

import React, { useEffect, useState } from 'react';
import { useAttractionsStore, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { useB2CTheme } from '@/components/ui/B2CThemeComponents';
import { usePointerIntent } from '@/lib/usePointerIntent';

// Dedicated Attraction Page Components
import { CinematicHeroUniversal } from '@/components/b2c/story/CinematicHeroUniversal';
import { AttractionsDirectory } from '@/components/b2c/AttractionsDirectory';
import { ExperienceWorldsStage } from '@/components/b2c/story/ExperienceWorldsStage';
import { TactileDigitalTicket } from '@/components/b2c/story/TactileDigitalTicket';

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

  useEffect(() => {
    if (cmsData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveCmsContent(cmsData);
    }
  }, [cmsData]);

  useEffect(() => {
    let abortController = new AbortController();

    const fetchLatestCMS = async () => {
      abortController.abort();
      abortController = new AbortController();

      try {
        const res = await fetch('/api/cms/pages/b2c-attractions?t=' + Date.now(), { 
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

    window.addEventListener('e3_cms_b2c_attractions_updated', fetchLatestCMS);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('e3_cms_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'b2c_attractions_updated') {
          fetchLatestCMS();
        }
      };
    } catch (_e) {}

    return () => {
      abortController.abort();
      window.removeEventListener('e3_cms_b2c_attractions_updated', fetchLatestCMS);
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
      {/* 1. Cinematic Universal Hero Banner for Attractions */}
      <CinematicHeroUniversal content={liveCmsContent} locale={locale} />

      {/* 2. Attractions Directory & Real Leaflet Interactive Cartography Map */}
      <AttractionsDirectory initialAttractions={initialAttractions.length > 0 ? initialAttractions : (_attractions as any)} locale={locale} />

      {/* 3. Featured Attraction Worlds */}
      <ExperienceWorldsStage content={liveCmsContent} locale={locale} />

      {/* 4. Direct Ticket Booking CTA */}
      <TactileDigitalTicket content={liveCmsContent} locale={locale} />
    </div>
  );
}

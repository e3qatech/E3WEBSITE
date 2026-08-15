"use client"

import React from 'react'
import { E3LivingHero, E3LivingHeroPreset } from '@/components/b2c/hero/E3LivingHero'

interface CinematicHeroUniversalProps {
  content: any
  locale?: string
  preset?: E3LivingHeroPreset
}

export function CinematicHeroUniversal({
  content,
  locale = 'en',
  preset = 'memory-engine'
}: CinematicHeroUniversalProps) {
  const heroMedia = content?.heroMedia || {}
  const hero = content?.hero || {}
  const act1Hero = content?.act1Hero || {}
  const act1 = content?.act1 || {}
  const livingHeroData = content?.e3LivingHero || {}

  const eyebrowEn = livingHeroData.eyebrowEn || heroMedia.badgeEn || hero.badgeEn || act1Hero.badgeEn || "E3 QATAR ENTERTAINMENT WORLDS"
  const eyebrowAr = livingHeroData.eyebrowAr || heroMedia.badgeAr || hero.badgeAr || act1Hero.badgeAr || "عالم إي ثري الترفيهي بقطر"

  const fixedHeadlineEn = livingHeroData.fixedHeadlineEn || act1Hero.fixedHeadlineEn || hero.headerEn || act1Hero.titleEn || "SOME DAYS PASS. OTHERS BECOME"
  const fixedHeadlineAr = livingHeroData.fixedHeadlineAr || act1Hero.fixedHeadlineAr || hero.headerAr || act1Hero.titleAr || "بعض الأيام تمضي. وأخرى تصبح"

  const hasExplicitLivingHero = Boolean(livingHeroData.fixedHeadlineEn || livingHeroData.rotatingWordsEn?.length || act1Hero.fixedHeadlineEn)

  const rotatingWordsEn = Array.isArray(livingHeroData.rotatingWordsEn) && livingHeroData.rotatingWordsEn.length > 0
    ? livingHeroData.rotatingWordsEn
    : (Array.isArray(act1Hero.rotatingWordsEn) && act1Hero.rotatingWordsEn.length > 0
        ? act1Hero.rotatingWordsEn
        : (hasExplicitLivingHero ? ["STORIES", "ADVENTURES", "MOMENTS", "MEMORIES"] : []))

  const rotatingWordsAr = Array.isArray(livingHeroData.rotatingWordsAr) && livingHeroData.rotatingWordsAr.length > 0
    ? livingHeroData.rotatingWordsAr
    : (Array.isArray(act1Hero.rotatingWordsAr) && act1Hero.rotatingWordsAr.length > 0
        ? act1Hero.rotatingWordsAr
        : (hasExplicitLivingHero ? ["حكايات", "مغامرات", "لحظات", "ذكريات"] : []))

  const enableRotating = livingHeroData.enableRotatingWords !== undefined
    ? livingHeroData.enableRotatingWords
    : (hasExplicitLivingHero || rotatingWordsEn.length > 0)

  const descriptionEn = livingHeroData.descriptionEn || act1Hero.subtextEn || act1.subtextEn || hero.subHeaderEn || "Enter a world of attractions, live experiences and unforgettable moments created by E3 in Qatar."
  const descriptionAr = livingHeroData.descriptionAr || act1Hero.subtextAr || act1.subtextAr || hero.subHeaderAr || "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية واللحظات التي لا تُنسى مع E3 في قطر."

  const mediaUrl = (
    livingHeroData.media?.mediaUrl ||
    heroMedia.mediaUrl ||
    hero.mediaUrl ||
    act1Hero.desktopVideoUrl ||
    act1Hero.mediaUrl ||
    act1.mediaUrl ||
    ""
  ).trim()

  const posterUrl = (
    livingHeroData.media?.posterUrl ||
    heroMedia.posterUrl ||
    hero.posterUrl ||
    act1Hero.posterUrl ||
    act1.posterUrl ||
    ""
  ).trim()

  const rawMediaType = (livingHeroData.media?.mediaType || heroMedia.mediaType || hero.mediaType || act1Hero.mediaType || 'IMAGE').toUpperCase()

  const primaryLabelEn = livingHeroData.primaryCta?.labelEn || act1Hero.tab1LabelEn || hero.tab1LabelEn || act1.primaryCtaEn || "Begin Your Story"
  const primaryLabelAr = livingHeroData.primaryCta?.labelAr || act1Hero.tab1LabelAr || hero.tab1LabelAr || act1.primaryCtaAr || "ابدأ حكايتك"
  const primaryUrl = livingHeroData.primaryCta?.url || act1Hero.tab1Url || hero.tab1Url || act1.primaryCtaUrl || "/{locale}/b2c/attractions"

  const secondaryLabelEn = livingHeroData.secondaryCta?.labelEn || act1Hero.tab2LabelEn || hero.tab2LabelEn || act1.secondaryCtaEn || "See What's On Today"
  const secondaryLabelAr = livingHeroData.secondaryCta?.labelAr || act1Hero.tab2LabelAr || hero.tab2LabelAr || act1.secondaryCtaAr || "اكتشف فعاليات اليوم"
  const secondaryUrl = livingHeroData.secondaryCta?.url || act1Hero.tab2Url || hero.tab2Url || act1.secondaryCtaUrl || "/{locale}/b2c/calendar"

  const resolvedPreset: E3LivingHeroPreset = livingHeroData.preset || preset

  const headlineTemplateEn = livingHeroData.headlineTemplateEn || act1Hero.headlineTemplateEn || fixedHeadlineEn
  const headlineTemplateAr = livingHeroData.headlineTemplateAr || act1Hero.headlineTemplateAr || fixedHeadlineAr
  const animationType = livingHeroData.animationType || act1Hero.animationType || 'blur-morph'
  const wordStyle = livingHeroData.wordStyle || act1Hero.wordStyle || 'static-gradient'
  const alignmentEn = livingHeroData.alignmentEn || act1Hero.alignmentEn || hero.alignmentEn || livingHeroData.alignment || act1Hero.alignment || hero.alignment || 'center'
  const alignmentAr = livingHeroData.alignmentAr || act1Hero.alignmentAr || hero.alignmentAr || livingHeroData.alignment || act1Hero.alignment || hero.alignment || 'center'
  const alignment = livingHeroData.alignment || act1Hero.alignment || hero.alignment
  const animationDuration = livingHeroData.animationDuration || act1Hero.animationDuration || 600
  const animationSpeed = livingHeroData.animationSpeed || act1Hero.animationSpeed || 2800

  return (
    <E3LivingHero
      eyebrowEn={eyebrowEn}
      eyebrowAr={eyebrowAr}
      fixedHeadlineEn={fixedHeadlineEn}
      fixedHeadlineAr={fixedHeadlineAr}
      headlineTemplateEn={headlineTemplateEn}
      headlineTemplateAr={headlineTemplateAr}
      rotatingWordsEn={rotatingWordsEn}
      rotatingWordsAr={rotatingWordsAr}
      descriptionEn={descriptionEn}
      descriptionAr={descriptionAr}
      primaryCta={{
        labelEn: primaryLabelEn,
        labelAr: primaryLabelAr,
        url: primaryUrl
      }}
      secondaryCta={{
        labelEn: secondaryLabelEn,
        labelAr: secondaryLabelAr,
        url: secondaryUrl
      }}
      media={{
        mediaType: rawMediaType,
        mediaUrl,
        posterUrl,
        overlayOpacity: livingHeroData.media?.overlayOpacity !== undefined ? livingHeroData.media.overlayOpacity : 0.6,
        gradientScrim: livingHeroData.media?.gradientScrim !== false
      }}
      preset={resolvedPreset}
      animationSpeed={animationSpeed}
      animationDuration={animationDuration}
      animationType={animationType}
      wordStyle={wordStyle}
      alignmentEn={alignmentEn}
      alignmentAr={alignmentAr}
      alignment={alignment}
      enableRotatingWords={enableRotating}
      locale={locale}
    />
  )
}

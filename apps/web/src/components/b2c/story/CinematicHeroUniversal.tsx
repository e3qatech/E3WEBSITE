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

  const eyebrowEn = livingHeroData.eyebrowEn || content?.eyebrowEn || heroMedia.badgeEn || hero.badgeEn || act1Hero.badgeEn || "ALL-ACCESS ENTERTAINMENT DIRECTORY"
  const eyebrowAr = livingHeroData.eyebrowAr || content?.eyebrowAr || heroMedia.badgeAr || hero.badgeAr || act1Hero.badgeAr || "دليل الوجهات والتجارب الترفيهية الشامل"

  const headlineTemplateEn = livingHeroData.headlineTemplateEn || content?.headlineTemplateEn || livingHeroData.fixedHeadlineEn || content?.fixedHeadlineEn || act1Hero.headlineTemplateEn || act1Hero.fixedHeadlineEn || hero.headerEn || act1Hero.titleEn || content?.titleEn || "STEP INTO A WORLD OF {{animated}}"
  const headlineTemplateAr = livingHeroData.headlineTemplateAr || content?.headlineTemplateAr || livingHeroData.fixedHeadlineAr || content?.fixedHeadlineAr || act1Hero.headlineTemplateAr || act1Hero.fixedHeadlineAr || hero.headerAr || act1Hero.titleAr || content?.titleAr || "ادخل إلى عالم من {{animated}}"

  const fixedHeadlineEn = livingHeroData.fixedHeadlineEn || content?.fixedHeadlineEn || headlineTemplateEn
  const fixedHeadlineAr = livingHeroData.fixedHeadlineAr || content?.fixedHeadlineAr || headlineTemplateAr

  const hasExplicitLivingHero = Boolean(
    livingHeroData.fixedHeadlineEn ||
    livingHeroData.headlineTemplateEn ||
    content?.fixedHeadlineEn ||
    content?.headlineTemplateEn ||
    livingHeroData.rotatingWordsEn?.length ||
    content?.rotatingWordsEn?.length ||
    act1Hero.fixedHeadlineEn
  )

  const rotatingWordsEn = Array.isArray(livingHeroData.rotatingWordsEn) && livingHeroData.rotatingWordsEn.length > 0
    ? livingHeroData.rotatingWordsEn
    : (Array.isArray(content?.rotatingWordsEn) && content.rotatingWordsEn.length > 0
        ? content.rotatingWordsEn
        : (Array.isArray(act1Hero.rotatingWordsEn) && act1Hero.rotatingWordsEn.length > 0
            ? act1Hero.rotatingWordsEn
            : (hasExplicitLivingHero ? ["PLAY", "WONDER", "ADVENTURE", "DISCOVERY"] : [])))

  const rotatingWordsAr = Array.isArray(livingHeroData.rotatingWordsAr) && livingHeroData.rotatingWordsAr.length > 0
    ? livingHeroData.rotatingWordsAr
    : (Array.isArray(content?.rotatingWordsAr) && content.rotatingWordsAr.length > 0
        ? content.rotatingWordsAr
        : (Array.isArray(act1Hero.rotatingWordsAr) && act1Hero.rotatingWordsAr.length > 0
            ? act1Hero.rotatingWordsAr
            : (hasExplicitLivingHero ? ["اللعب", "الإبهار", "المغامرة", "الاكتشاف"] : [])))

  const enableRotating = livingHeroData.enableRotatingWords !== undefined
    ? livingHeroData.enableRotatingWords
    : (content?.enableRotatingWords !== undefined
        ? content.enableRotatingWords
        : (hasExplicitLivingHero || rotatingWordsEn.length > 0))

  const descriptionEn = livingHeroData.descriptionEn || content?.descriptionEn || content?.descEn || act1Hero.subtextEn || act1.subtextEn || hero.subHeaderEn || "Search, filter, and book world-class entertainment attractions, indoor kinetic parks, and live character activations across Qatar."
  const descriptionAr = livingHeroData.descriptionAr || content?.descriptionAr || content?.descAr || act1Hero.subtextAr || act1.subtextAr || hero.subHeaderAr || "استكشف واحجز أفضل تجارب الترفيه العائلي والمدن الحركية المغلقة والفعاليات الحية في قطر."

  const mediaUrl = (
    content?.heroMedia?.mediaUrl ||
    heroMedia.mediaUrl ||
    livingHeroData.media?.mediaUrl ||
    hero.mediaUrl ||
    act1Hero.desktopVideoUrl ||
    act1Hero.mediaUrl ||
    act1.mediaUrl ||
    ""
  ).trim()

  const mobileMediaUrl = (
    content?.heroMedia?.mobileMediaUrl ||
    heroMedia.mobileMediaUrl ||
    livingHeroData.media?.mobileMediaUrl ||
    ""
  ).trim()

  const posterUrl = (
    content?.heroMedia?.posterUrl ||
    heroMedia.posterUrl ||
    livingHeroData.media?.posterUrl ||
    hero.posterUrl ||
    act1Hero.posterUrl ||
    act1.posterUrl ||
    ""
  ).trim()

  const rawMediaType = (
    content?.heroMedia?.mediaType ||
    heroMedia.mediaType ||
    livingHeroData.media?.mediaType ||
    hero.mediaType ||
    act1Hero.mediaType ||
    'IMAGE'
  ).toUpperCase()

  const primaryLabelEn = livingHeroData.primaryCta?.labelEn || content?.primaryCta?.labelEn || content?.primaryCtaEn || act1Hero.tab1LabelEn || hero.tab1LabelEn || act1.primaryCtaEn || "Explore Attractions"
  const primaryLabelAr = livingHeroData.primaryCta?.labelAr || content?.primaryCta?.labelAr || content?.primaryCtaAr || act1Hero.tab1LabelAr || hero.tab1LabelAr || act1.primaryCtaAr || "استكشف الوجهات"
  const primaryUrl = livingHeroData.primaryCta?.url || content?.primaryCta?.url || content?.primaryCtaUrl || act1Hero.tab1Url || hero.tab1Url || act1.primaryCtaUrl || "#attractions-grid"

  const secondaryLabelEn = livingHeroData.secondaryCta?.labelEn || content?.secondaryCta?.labelEn || content?.secondaryCtaEn || act1Hero.tab2LabelEn || hero.tab2LabelEn || act1.secondaryCtaEn || "View Live Calendar"
  const secondaryLabelAr = livingHeroData.secondaryCta?.labelAr || content?.secondaryCta?.labelAr || content?.secondaryCtaAr || act1Hero.tab2LabelAr || hero.tab2LabelAr || act1.secondaryCtaAr || "عرض جدول الفعاليات"
  const secondaryUrl = livingHeroData.secondaryCta?.url || content?.secondaryCta?.url || content?.secondaryCtaUrl || act1Hero.tab2Url || hero.tab2Url || act1.secondaryCtaUrl || "/{locale}/b2c/calendar"

  const resolvedPreset: E3LivingHeroPreset = livingHeroData.preset || content?.preset || preset

  const animationType = livingHeroData.animationType || content?.animationType || act1Hero.animationType || 'blur-morph'
  const wordStyle = livingHeroData.wordStyle || content?.wordStyle || act1Hero.wordStyle || 'static-gradient'
  const alignmentEn = livingHeroData.alignmentEn || content?.alignmentEn || act1Hero.alignmentEn || hero.alignmentEn || 'center'
  const alignmentAr = livingHeroData.alignmentAr || content?.alignmentAr || act1Hero.alignmentAr || hero.alignmentAr || 'center'
  const alignment = livingHeroData.alignment || content?.alignment || act1Hero.alignment || hero.alignment
  const animationDuration = livingHeroData.animationDuration || content?.animationDuration || act1Hero.animationDuration || 600
  const animationSpeed = livingHeroData.animationSpeed || content?.animationSpeed || act1Hero.animationSpeed || 2800
  const accentColor = livingHeroData.accentColor || content?.accentColor

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
        mobileMediaUrl,
        posterUrl,
        overlayOpacity: livingHeroData.media?.overlayOpacity !== undefined ? livingHeroData.media.overlayOpacity : (content?.heroMedia?.overlayOpacity !== undefined ? content.heroMedia.overlayOpacity : 0.6),
        gradientScrim: livingHeroData.media?.gradientScrim !== undefined ? livingHeroData.media.gradientScrim : (content?.heroMedia?.gradientScrim !== false)
      }}
      preset={resolvedPreset}
      accentColor={accentColor}
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

export interface AttractionPricingDTO {
  id?: string;
  titleEn: string;
  titleAr: string;
  price: number;
  currency?: string;
  type?: string;
}

export interface AttractionOfferDTO {
  id?: string;
  code: string;
  discount: number;
  validUntil?: string | null;
}

export interface AttractionFaqDTO {
  id?: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  orderIndex?: number;
}

export interface AttractionGalleryItemDTO {
  id?: string;
  url: string;
  captionEn?: string | null;
  captionAr?: string | null;
  orderIndex?: number;
}

export interface AttractionSocialLinkDTO {
  id?: string;
  platform: string;
  url: string;
}

export interface AttractionTemporalRuleDTO {
  id?: string;
  ruleType: 'RECURRING' | 'OVERRIDE' | 'CLOSURE';
  startDate?: string | null;
  endDate?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  daysOfWeek?: number[] | null;
  notes?: string | null;
}

export interface AttractionDTO {
  id?: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  coordinates?: any;
  isPublished?: boolean;
  isHidden?: boolean;

  pricing?: AttractionPricingDTO[];
  offers?: AttractionOfferDTO[];
  faqs?: AttractionFaqDTO[];
  gallery?: AttractionGalleryItemDTO[];
  socialLinks?: AttractionSocialLinkDTO[];
  temporalRules?: AttractionTemporalRuleDTO[];
}

export interface AttractionListResponse {
  data: Partial<AttractionDTO>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}

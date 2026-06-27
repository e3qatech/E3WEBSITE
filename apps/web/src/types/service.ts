export interface ServiceGalleryItemDTO {
  id?: string;
  url: string;
  captionEn?: string | null;
  captionAr?: string | null;
  orderIndex?: number;
}

export interface ServiceProjectDTO {
  id?: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  imageUrl?: string | null;
}

export interface ServiceDTO {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  taglineEn?: string | null;
  taglineAr?: string | null;
  thumbnail?: string | null;
  contentEn?: string | null;
  contentAr?: string | null;
  isFeatured?: boolean;
  isVisible?: boolean;
  
  gallery?: ServiceGalleryItemDTO[];
  projects?: ServiceProjectDTO[];
}

export interface ServiceListResponse {
  data: Partial<ServiceDTO>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}

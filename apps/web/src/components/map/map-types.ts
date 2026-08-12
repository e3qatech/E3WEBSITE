export type LocationType = 
  | 'PERMANENT_ATTRACTION' 
  | 'MALL_ACTIVATION' 
  | 'SEASONAL_ATTRACTION' 
  | 'EVENT' 
  | 'ACTIVE_PROJECT' 
  | 'PAST_PROJECT' 
  | 'OFFICE' 
  | 'OTHER';

export type OperationalStatus = 
  | 'OPEN' 
  | 'COMING_SOON' 
  | 'TEMPORARILY_CLOSED' 
  | 'SEASONAL' 
  | 'ENDED' 
  | 'INACTIVE';

export type PinColorToken = 'CYAN' | 'GOLD' | 'PURPLE' | 'AMBER' | 'GREY';

export interface MapLocationProperties {
  locationId: string;
  slug: string;
  name: string;
  nameEn: string;
  nameAr: string;
  venue: string;
  address: string;
  shortDescription?: string;
  locationType: LocationType;
  operationalStatus: OperationalStatus;
  thumbnailUrl: string;
  pinColorToken: PinColorToken;
  featured: boolean;
  attractionCount: number;
  ticketingUrl?: string;
  directionsUrl?: string;
  googleMapsUrl?: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  attractions?: Array<{
    id: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    heroMediaUrl?: string;
    ticketingUrl?: string;
  }>;
}

export interface MapGeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: MapLocationProperties;
}

export interface MapGeoJSONCollection {
  type: 'FeatureCollection';
  features: MapGeoJSONFeature[];
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
  styleUrl?: string;
  enable3D?: boolean;
  enableClustering?: boolean;
}

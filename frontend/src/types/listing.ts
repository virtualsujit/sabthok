export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  children?: Category[];
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  level: "province" | "district" | "city";
}

export interface ListingImage {
  id: string;
  image: string;
  ordering: number;
}

export interface Breadcrumb {
  name: string;
  slug: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  price: string;
  price_type: "fixed" | "negotiable";
  condition: "new" | "like_new" | "used";
  status: string;
  thumbnail: string | null;
  category: Category;
  location: Location;
  seller_name: string;
  views_count: number;
  is_featured: boolean;
  created_at: string;
}

export interface ListingDetail extends Omit<ListingSummary, "thumbnail"> {
  description: string;
  images: ListingImage[];
  seller_id: string;
  seller_phone: string | null;
  seller_email: string | null;
  seller_is_verified: boolean;
  similar_listings: ListingSummary[];
  breadcrumbs: Breadcrumb[];
  is_watched: boolean;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

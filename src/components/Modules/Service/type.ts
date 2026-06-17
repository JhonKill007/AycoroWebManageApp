// types/catalog.ts
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'service' | 'product' | 'professional';
  type: string; // Subcategoría específica
  images: string[];
  contactInfo: {
    email: string;
    phone: string;
    location: string;
  };
  rating: number;
  reviewCount: number;
  reviews: Review[];
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: Date;
  tags: string[];
  availability?: string;
  experience?: string; // Para profesionales
  specifications?: Record<string, string>; // Para productos
}

export interface FilterOptions {
  category: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  location: string;
}
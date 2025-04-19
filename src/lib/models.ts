export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
};

export type Property = {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  priceType: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities: string[];
  ownerId: string;
  ownerName: string;
  ownerImage?: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  type: string;
  createdAt: Date;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  count?: number;
};

export type Experience = {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  hostId: string;
  hostName: string;
  hostImage?: string;
  duration: number;
  languages: string[];
  included: string[];
  createdAt: Date;
};

export interface PropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  propertyType?: string;
  searchTerm?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  startDate: any; // Firestore timestamp
  endDate: any; // Firestore timestamp
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: any;
}

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: any;
}

/** @format */

// Authentication types
export interface User {
  uid: string;
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "manager" | "staff";
  photoURL?: string;
  restaurantId: string;
  createdAt: Date;
  orders: Order[];
  updatedAt: Date;
  lastLoginAt: Date;
  phone: string;
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  cuisineTypes: string[];
  openingHours: OpeningHours[];
  deliveryOptions: DeliveryOption[];
  packagingCharges: number;
}

export interface OpeningHours {
  day: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

export interface DeliveryOption {
  type: string;
  available: boolean;
  minOrderAmount: number;
  deliveryFee: number;
}
// Food types
export interface Category {
  id: string;
  name: string;
  image?: string;
  // isActive: boolean;
  description: string;
  longDescription: string;
  status: boolean;
  userId: string;
}
export interface Cuisine {
  id: string;
  name: string;
  image?: string;
  // isActive: boolean;
  description: string;
  longDescription: string;
  status: boolean;
  userId: string;
}
export interface Food {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  categoryId: string;
  isAvailable: boolean;
  preparationTime: number;
  variations: Variation[];
  addons: Addon[];
  restaurantId: string;
  totalSold: number;
  rating: number;
  reviewCount: number;
  cuisineId: string;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface Variation {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  OrderStatus: string;
  tax: number;
  deliveryLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryOption: string;
  deliveryFee: number;
  packagingFee: number;

  userId: string;
  discount: number;
  total: number;
  paymentStatus: "paid" | "unpaid" | "refunded";
  paymentMethod: string;
  orderStatus: OrderStatus;
  orderDate: Date;
  deliveryDate?: Date;
  restaurantId: string;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  orderConfirmedAt: Date;
  paymentConfirmedAt: Date;
}

export interface OrderItem {
  id: string;
  foodId: string;
  name: string;
  quantity: number;
  price: number;
  variations: Variation[];
  addons: Addon[];
  subtotal: number;
}

export type OrderStatus = "pending" | "in-progress" | "delivered" | "canceled";

// Employee types
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "chef" | "delivery" | "staff";
  isActive: boolean;
  dateJoined: Date;
  restaurantId: string;
  image?: string;
}
// Deliveryman type definition
export interface Deliveryman {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string; // Optional in some contexts like updates
  zone: string;
  vehicle: string;
  identityType: string;
  identityNumber: string;
  age: string | number;
  birthdate: string; // ISO date string
  profileImageUrl?: string; // URL or base64 string
  identityImageUrl?: string; // URL or base64 string
  licenseFile?: string; // URL or base64 string
  status: "active" | "inactive" | "suspended";
  createdAt?: Date;
  updatedAt?: Date;
  isApproved: boolean;
}

// Promotion types
export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  restaurantId: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  maxUses?: number;
  usesCount: number;
  isActive: boolean;
  restaurantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface restaurantGallery {
  category: string;
  image: string;
  id: string;
  description: string;
  createdAt: Date;
  title: string;
}
export interface TrendingFood {
  id: string;
  name: string;
  image: string;
  discount: number;
  originalPrice: number;
  discountedPrice?: number;
}
// Dashboard types
export interface OrderStatistics {
  confirmed: number;
  cooking: number;
  ready: number;
  on_the_way: number;
  delivered: number;
  refunded: number;
  scheduled: number;
  total: number;
}

export interface YearlySales {
  month: string;
  sales: number;
  commission: number;
}

export interface TopSellingFood {
  id: string;
  name: string;
  image: string;
  soldCount: number;
}

export interface TopRatedFood {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
}
export interface MetaData {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  restaurantId: string;
  type: string;
  status: string;
  imageUrl: string;
  // Removed as per the new requirement
  // restaurantId: string;
}
export interface RestaurantConfig {
  id: string;
  restaurantId: string;
  configKey: string;
  configValue: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  type: string;
  status: string;
  imageUrl: string;
  // Removed as per the new requirement
}

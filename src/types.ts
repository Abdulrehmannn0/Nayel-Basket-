/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  sentiment?: "positive" | "neutral" | "negative";
  likes: number;
}

export interface QAItem {
  id: string;
  question: string;
  askedBy: string;
  dateAsked: string;
  answer?: string;
  answeredBy?: string;
  dateAnswered?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  gallery?: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  features: string[];
  sizes?: string[];
  colors?: string[];
  reviews: Review[];
  qa: QAItem[];
  brand: string;
  tags?: string[];
  sku: string;
  videoUrl?: string;
  specifications?: Record<string, string>;
  frequentlyBoughtTogetherIds?: string[];
}

export interface CartItem {
  id: string; // combination of product.id + size + color
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export interface TrackingEvent {
  title: string;
  description: string;
  timestamp: string;
  location: string;
  status: "completed" | "current" | "upcoming";
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  reason: string;
  details: string;
  status: "Pending" | "Approved" | "Rejected";
  dateRequested: string;
  refundAmount: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
  shippingAddress: Address;
  paymentMethod: "Card" | "UPI" | "Razorpay" | "Stripe" | "COD" | "Wallet";
  tracking: TrackingEvent[];
  otp: string;
  rewardPointsEarned: number;
  returnRequest?: ReturnRequest;
}

export interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSpend: number;
  description: string;
  expiry: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: "order" | "promo" | "ai" | "system";
  timestamp: string;
  read: boolean;
}

export interface Message {
  id: string;
  sender: "user" | "ai" | "support";
  text: string;
  timestamp: string;
  type?: "text" | "outfit" | "comparison" | "size_recommendation" | "products_list";
  data?: any; // generic carrier for structured AI recommendations
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  timestamp: string;
}

export interface SellerDashboardStats {
  totalSales: number;
  pendingSettlement: number;
  totalOrdersCount: number;
  rating: number;
  inventoryHealth: "excellent" | "fair" | "critical";
  walletBalance: number;
  transactions: WalletTransaction[];
}

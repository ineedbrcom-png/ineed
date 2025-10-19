import type { CurrentView as types_CurrentView, Location as types_Location, Request as types_Request, VerificationStatus as types_VerificationStatus, User as types_User, OrderOffer as types_OrderOffer, UserOrder as types_UserOrder, Category as types_Category, Testimonial as types_Testimonial, Message as types_Message, ConversationParticipant as types_ConversationParticipant, Conversation as types_Conversation, ContractDetails as types_ContractDetails, Review as types_Review } from "./types";
export type CurrentView = 'home' | 'explore' | 'profile' | 'my-orders' | 'settings' | 'messages' | 'review' | 'notifications';

export interface Location {
  lat: number;
  lng: number;
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  categoryId: string;
  type: 'service' | 'product';
  location: Location;
  budget?: string;
  photos?: string[];
}

export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  document: boolean;
}

export interface Notification {
    id: string;
    text: string;
    date: string;
    read: boolean;
    link?: string; // Optional link to navigate to
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  location: string;
  memberSince: string;
  isPremium: boolean;
  rating: {
    average: number;
    count: number;
  };
  verifications: VerificationStatus;
  serviceCategories?: string[];
  portfolio?: string[];
  pricing?: number;
  workingHours?: string;
  serviceArea: {
    center: Location;
    radius: number;
  };
  ordersAsClient: UserOrder[];
  ordersAsProvider: UserOrder[];
  reviewsAsClient: Review[];
  conversations: Conversation[];
  notifications: Notification[];
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
}

export interface OrderOffer {
    id: string;
    providerId: string;
    providerName: string;
    providerAvatar: string;
    providerRating: number;
    value: number;
    message: string;
}

export interface UserOrder {
  id: string;
  requestId?: string;
  title: string;
  description: string;
  status: 'Ativo' | 'Concluído' | 'Cancelado';
  date: string;
  categoryId: string;
  providerName?: string;
  isReviewed: boolean;
  offersCount: number;
  offers: OrderOffer[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'service' | 'product';
}

export interface Testimonial {
  id: number;
  text: string;
  authorName: string;
  authorRole: string;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: string;
}

export interface ConversationParticipant {
    id: string;
    name: string;
    avatarUrl: string;
    rating?: number;
    isVerified?: boolean;
    isSystem?: boolean;
}

export interface Conversation {
  id: string;
  otherParticipant: ConversationParticipant;
  orderTitle: string;
  messages: Message[];
  unread: boolean;
}

export interface ContractDetails {
    clientName: string;
    providerName: string;
    serviceDescription: string;
    value: number;
    deliveryTime: string;
    date: string;
}

export interface Review {
    id: string;
    orderId: string;
    authorName: string;
    authorAvatar: string;
    rating: number;
    text: string;
    date: string;
    criteria: {
        communication: number;
        quality: number;
        punctuality: number;
    }
}

// --- API Service Types ---

export interface ModerationResult {
  isInappropriate: boolean;
  reason: string;
}

export interface ContractGenerationResult {
    value: number | null;
    serviceDescription: string | null;
    deliveryTime: string | null;
}

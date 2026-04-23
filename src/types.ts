export type UserRole = 'user' | 'owner' | 'vendor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: 'PG' | 'Room' | 'Flat';
  price: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[];
  amenities: string[];
  status: 'available' | 'booked' | 'hidden';
  createdAt: any;
}

export interface Booking {
  id: string;
  propertyId: string;
  ownerId: string;
  userId: string;
  startDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: any;
}

export interface FoodPlan {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  frequency: 'daily' | 'monthly';
  status: string;
}

export interface Appliance {
  id: string;
  vendorId: string;
  name: string;
  type: string;
  monthlyRent: number;
  status: string;
}

export interface HomeService {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  price: number;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage?: string;
  updatedAt: any;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: any;
}

export interface FoodSubscription {
  id: string;
  planId: string;
  vendorId: string;
  userId: string;
  status: 'active' | 'pending' | 'cancelled';
  startDate: any;
  endDate: any;
}

export interface ApplianceRental {
  id: string;
  applianceId: string;
  vendorId: string;
  userId: string;
  status: 'active' | 'pending' | 'returned';
  rentalPeriod: number; // months
  startDate: any;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  vendorId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: any;
  createdAt: any;
}

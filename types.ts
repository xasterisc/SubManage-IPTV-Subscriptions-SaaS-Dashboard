// Fix: Create type definitions for the application
export enum Role {
  Admin = 'Admin',
  Support = 'Support',
}

export enum SubscriberStatus {
  Active = 'Active',
  Expiring = 'Expiring',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
  Trial = 'Trial',
}

export interface Communication {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'Email' | 'WhatsApp';
  message: string;
  status: 'sent' | 'delivered' | 'failed';
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  paidAt: string;
  method: string;
}

export interface Subscriber {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  plan: '1m' | '3m' | '6m' | '12m';
  startDate: string;
  endDate: string;
  status: SubscriberStatus;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  communications: Communication[];
  payments: Payment[];
}

export interface StaffUser {
  id?: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  lastLogin: string;
}

export type View = 
  | 'dashboard'
  | 'subscribers'
  | 'staff'
  | 'settings'
  | 'profile'
  | 'productSpec'
  | 'mvp'
  | 'dataModel'
  | 'api'
  | 'integrations'
  | 'security'
  | 'roadmap';

export type SubscriberFilter = SubscriberStatus | 'all';
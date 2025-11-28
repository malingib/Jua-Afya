export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  lastVisit: string;
  notes: string;
  history: string[]; // Array of past visit summaries
  vitals?: {
    bp: string;
    heartRate: string;
    temp: string;
    weight: string;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  category: 'Medicine' | 'Supply' | 'Lab';
  price: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ClinicSettings {
  name: string;
  phone: string;
  email: string;
  location: string;
  currency: string;
  language: string;
  smsEnabled: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ViewState = 'dashboard' | 'patients' | 'appointments' | 'pharmacy' | 'reports' | 'settings' | 'profile';
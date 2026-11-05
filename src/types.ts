export interface Doctor {
  id: string;
  name: string;
  nameTa?: string;
  specialty: string;
  specialtyTa?: string;
  qualification: string;
  room: string;
  experience?: string;
  sessions: string[];
  prefix: string;
  dailyCapacity: number;
  avgConsultMinutes: number;
  avatar?: string;
}

export interface Hospital {
  id: string;
  name: string;
  nameTa?: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  opdHours: string;
  rating?: number;
  isVerified?: boolean;
  specialties: string[];
  doctors: Doctor[];
}

export interface TokenBooking {
  id: string;
  displayToken: string;
  sequenceNumber: number;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  date: string;
  session: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'EXPIRED';
  paymentStatus: 'UNPAID' | 'PAID' | 'SIMULATED_SUCCESS' | 'SIMULATED_FAILED' | 'EXPIRED';
  paymentMethod?: string;
  paymentReference?: string;
  feeAmount: number;
  createdAt: string;
  calledAt?: string;
  servingStartedAt?: string;
  completedAt?: string;
}

export interface QueueState {
  id: string;
  hospitalId: string;
  doctorId: string;
  date: string;
  totalAssigned: number;
  activeHolds: number;
  currentServingNumber: number;
  currentServingDisplay: string;
  currentServingStatus: 'IDLE' | 'CALLING' | 'SERVING' | 'PAUSED';
  maxCapacity: number;
}


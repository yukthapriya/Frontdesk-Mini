export interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Provider {
  _id: string;
  name: string;
  active: boolean;
}

export interface Slot {
  start: string;
  end: string;
  providerId: string;
  providerName: string;
}

export type ApptStatus =
  | 'booked'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  _id: string;
  customerName: string;
  customerPhone: string;
  service: Service;
  provider: Provider;
  start: string;
  end: string;
  status: ApptStatus;
  notes: string;
}

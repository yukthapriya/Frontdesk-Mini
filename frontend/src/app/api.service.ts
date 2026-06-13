import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service, Provider, Slot, Appointment, ApptStatus } from './models';
import { environment } from '../environments/environment';

const API = `${environment.apiUrl}/api`;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${API}/services`);
  }

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${API}/providers`);
  }

  getAvailability(serviceId: string, date: string): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${API}/availability`, {
      params: { serviceId, date },
    });
  }

  createAppointment(body: {
    customerName: string;
    customerPhone: string;
    serviceId: string;
    providerId: string;
    start: string;
  }): Observable<Appointment> {
    return this.http.post<Appointment>(`${API}/appointments`, body);
  }

  getAppointments(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${API}/appointments`, {
      params: { date },
    });
  }

  setStatus(apptId: string, status: ApptStatus): Observable<Appointment> {
    return this.http.patch<Appointment>(`${API}/appointments/${apptId}/status`, {
      status,
    });
  }
}

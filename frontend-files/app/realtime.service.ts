import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Appointment } from './models';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket: Socket = io('http://localhost:4000');

  // Emits whenever any appointment is created or updated anywhere.
  onApptEvent(): Observable<Appointment> {
    return new Observable<Appointment>((subscriber) => {
      const handler = (appt: Appointment) => subscriber.next(appt);
      this.socket.on('appointment:created', handler);
      this.socket.on('appointment:updated', handler);
      return () => {
        this.socket.off('appointment:created', handler);
        this.socket.off('appointment:updated', handler);
      };
    });
  }
}

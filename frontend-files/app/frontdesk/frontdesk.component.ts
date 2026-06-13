import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { RealtimeService } from '../realtime.service';
import { Appointment, ApptStatus } from '../models';

// The "happy path" lifecycle. No-show / cancel are branches off it.
const FLOW: ApptStatus[] = ['booked', 'checked_in', 'in_service', 'completed'];

@Component({
  selector: 'app-frontdesk',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Front desk <span class="muted">— live</span></h2>
    <input type="date" [value]="date" (change)="onDate($event)" />

    <div class="columns">
      @for (status of columns; track status) {
        <div class="col">
          <h3>{{ label(status) }}</h3>
          @for (appt of apptsByStatus(status); track appt._id) {
            <div class="appt">
              <strong>{{ appt.start | date: 'shortTime' }}</strong> — {{ appt.service.name }}
              <div>{{ appt.customerName }}</div>
              <div class="muted">{{ appt.provider.name }}</div>
              <div class="actions">
                @if (next(appt.status)) {
                  <button (click)="advance(appt)">→ {{ label(next(appt.status)!) }}</button>
                }
                @if (canNoShow(appt.status)) {
                  <button class="ghost" (click)="markNoShow(appt)">No-show</button>
                }
              </div>
            </div>
          } @empty {
            <p class="muted">None</p>
          }
        </div>
      }
    </div>

    @if (sidelined().length) {
      <div class="sidelined">
        <h4>No-shows / cancelled</h4>
        @for (appt of sidelined(); track appt._id) {
          <span class="pill">
            {{ appt.start | date: 'shortTime' }} {{ appt.customerName }}
            ({{ label(appt.status) }})
          </span>
        }
      </div>
    }
  `,
  styles: [`
    .columns { display: flex; gap: 16px; margin-top: 16px; align-items: flex-start; }
    .col { flex: 1; background: #f4f4f5; border-radius: 8px; padding: 10px; min-width: 160px; }
    .appt { background: white; border-radius: 6px; padding: 8px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .muted { color: #777; }
    button { margin-top: 6px; cursor: pointer; }
    .ghost { background: none; border: 1px solid #ccc; color: #555; }
    .sidelined { margin-top: 20px; }
    .pill { display: inline-block; background: #fde2e2; color: #991b1b; border-radius: 12px; padding: 2px 10px; margin: 2px; font-size: 13px; }
  `],
})
export class FrontdeskComponent implements OnInit {
  date = new Date().toISOString().slice(0, 10);
  appts: Appointment[] = [];
  columns: ApptStatus[] = ['booked', 'checked_in', 'in_service', 'completed'];

  constructor(private api: ApiService, private rt: RealtimeService) {}

  ngOnInit(): void {
    this.load();
    // Any change anywhere refreshes the board in real time.
    this.rt.onApptEvent().subscribe(() => this.load());
  }

  load(): void {
    this.api.getAppointments(this.date).subscribe((appts) => (this.appts = appts));
  }

  onDate(e: Event): void {
    this.date = (e.target as HTMLInputElement).value;
    this.load();
  }

  apptsByStatus(status: ApptStatus): Appointment[] {
    return this.appts.filter((a) => a.status === status);
  }

  sidelined(): Appointment[] {
    return this.appts.filter(
      (a) => a.status === 'no_show' || a.status === 'cancelled'
    );
  }

  next(status: ApptStatus): ApptStatus | null {
    const i = FLOW.indexOf(status);
    return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
  }

  canNoShow(status: ApptStatus): boolean {
    return status === 'booked' || status === 'checked_in';
  }

  advance(appt: Appointment): void {
    const n = this.next(appt.status);
    // No manual refresh: the emitted socket event triggers load() for everyone.
    if (n) this.api.setStatus(appt._id, n).subscribe();
  }

  markNoShow(appt: Appointment): void {
    this.api.setStatus(appt._id, 'no_show').subscribe();
  }

  label(status: ApptStatus): string {
    return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

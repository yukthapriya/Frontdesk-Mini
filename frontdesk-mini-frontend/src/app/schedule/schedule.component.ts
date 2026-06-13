import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { Appointment } from '../models';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Schedule</h2>
    <input type="date" [value]="date" (change)="onDate($event)" />

    @for (group of grouped(); track group.provider) {
      <div class="provider">
        <h3>{{ group.provider }}</h3>
        @for (appt of group.appts; track appt._id) {
          <div class="row">
            {{ appt.start | date: 'shortTime' }}–{{ appt.end | date: 'shortTime' }}
            · {{ appt.service.name }} · {{ appt.customerName }}
            <span class="badge">{{ appt.status }}</span>
          </div>
        } @empty {
          <p class="muted">No appointments.</p>
        }
      </div>
    } @empty {
      <p class="muted">No appointments scheduled for this day.</p>
    }
  `,
  styles: [`
    .provider { margin-top: 16px; }
    .row { padding: 6px 0; border-bottom: 1px solid #eee; }
    .badge { font-size: 12px; background: #eef; padding: 2px 6px; border-radius: 4px; margin-left: 6px; }
    .muted { color: #777; }
  `],
})
export class ScheduleComponent implements OnInit {
  date = new Date().toISOString().slice(0, 10);
  appts: Appointment[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getAppointments(this.date).subscribe((appts) => (this.appts = appts));
  }

  onDate(e: Event): void {
    this.date = (e.target as HTMLInputElement).value;
    this.load();
  }

  grouped(): { provider: string; appts: Appointment[] }[] {
    const map = new Map<string, Appointment[]>();
    for (const a of this.appts) {
      const name = a.provider?.name || 'Unassigned';
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push(a);
    }
    return Array.from(map.entries()).map(([provider, appts]) => ({ provider, appts }));
  }
}

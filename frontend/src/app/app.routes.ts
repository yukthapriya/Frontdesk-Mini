import { Routes } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { FrontdeskComponent } from './frontdesk/frontdesk.component';
import { ScheduleComponent } from './schedule/schedule.component';

export const routes: Routes = [
  { path: '', redirectTo: 'book', pathMatch: 'full' },
  { path: 'book', component: BookingComponent },
  { path: 'frontdesk', component: FrontdeskComponent },
  { path: 'schedule', component: ScheduleComponent },
];

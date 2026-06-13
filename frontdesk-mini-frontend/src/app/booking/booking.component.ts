import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Service, Slot } from '../models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2>Book an appointment</h2>
      <p class="muted">Step {{ step }} of 3</p>

      <!-- STEP 1: choose service + date -->
      @if (step === 1) {
        <form [formGroup]="step1">
          <label>Treatment</label>
          <select formControlName="serviceId">
            <option value="">Select a treatment…</option>
            @for (s of services; track s._id) {
              <option [value]="s._id">
                {{ s.name }} ({{ s.durationMinutes }} min — \${{ s.price }})
              </option>
            }
          </select>

          <label>Date</label>
          <input type="date" formControlName="date" />

          <button [disabled]="step1.invalid || loadingSlots" (click)="loadSlots()">
            {{ loadingSlots ? 'Finding times…' : 'Find available times' }}
          </button>
        </form>
      }

      <!-- STEP 2: pick a slot -->
      @if (step === 2) {
        <h3>Pick a time</h3>
        @if (slots.length === 0) {
          <p>No open times that day.
            <button class="link" (click)="step = 1">Try another date</button>
          </p>
        } @else {
          <div class="slots">
            @for (slot of slots; track slot.start + slot.providerId) {
              <button class="slot" (click)="chooseSlot(slot)">
                {{ slot.start | date: 'shortTime' }} — {{ slot.providerName }}
              </button>
            }
          </div>
          <button class="link" (click)="step = 1">← Back</button>
        }
      }

      <!-- STEP 3: customer details -->
      @if (step === 3 && !confirmed) {
        <form [formGroup]="step3" (ngSubmit)="submit()">
          <p class="muted">
            {{ chosen?.start | date: 'medium' }} with {{ chosen?.providerName }}
          </p>

          <label>Your name</label>
          <input formControlName="customerName" />
          @if (step3.controls['customerName'].touched && step3.controls['customerName'].invalid) {
            <small class="err">Name is required.</small>
          }

          <label>Phone</label>
          <input formControlName="customerPhone" />

          <button type="submit" [disabled]="step3.invalid || submitting">
            {{ submitting ? 'Booking…' : 'Confirm appointment' }}
          </button>
          <button type="button" class="link" (click)="step = 2">← Back</button>
          @if (error) { <p class="err">{{ error }}</p> }
        </form>
      }

      @if (confirmed) {
        <div class="ok">
          <h3>Booked!</h3>
          <p>See you {{ chosen?.start | date: 'medium' }}.</p>
          <button (click)="reset()">Book another</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .card { max-width: 520px; }
    label { display: block; margin-top: 12px; font-weight: 600; }
    input, select { width: 100%; padding: 8px; margin-top: 4px; box-sizing: border-box; }
    button { margin-top: 14px; padding: 8px 14px; cursor: pointer; }
    .slots { display: flex; flex-wrap: wrap; gap: 8px; }
    .slot { margin: 0; }
    .link { background: none; border: none; color: #2563eb; padding: 0; }
    .muted { color: #666; }
    .err { color: #dc2626; display: block; }
    .ok { color: #16a34a; }
  `],
})
export class BookingComponent implements OnInit {
  step = 1;
  services: Service[] = [];
  slots: Slot[] = [];
  chosen: Slot | null = null;
  loadingSlots = false;
  submitting = false;
  confirmed = false;
  error = '';

  // Declared here, but built in the constructor below. With Angular's
  // useDefineForClassFields, field initializers run BEFORE the constructor,
  // so `this.fb` would not exist yet if we built the forms inline here.
  step1: FormGroup;
  step3: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.step1 = this.fb.group({
      serviceId: ['', Validators.required],
      date: ['', Validators.required],
    });
    this.step3 = this.fb.group({
      customerName: ['', Validators.required],
      customerPhone: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.api.getServices().subscribe((s) => (this.services = s));
  }

  loadSlots(): void {
    const { serviceId, date } = this.step1.value;
    this.loadingSlots = true;
    this.api.getAvailability(serviceId!, date!).subscribe((slots) => {
      this.slots = slots;
      this.loadingSlots = false;
      this.step = 2;
    });
  }

  chooseSlot(slot: Slot): void {
    this.chosen = slot;
    this.step = 3;
  }

  submit(): void {
    if (!this.chosen) return;
    this.submitting = true;
    this.error = '';
    const details = this.step3.getRawValue();
    this.api
      .createAppointment({
        customerName: details.customerName!,
        customerPhone: details.customerPhone!,
        serviceId: this.step1.value.serviceId!,
        providerId: this.chosen.providerId,
        start: this.chosen.start,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.confirmed = true;
        },
        error: (e) => {
          this.submitting = false;
          this.error = e.error?.error || 'Something went wrong.';
        },
      });
  }

  reset(): void {
    this.step = 1;
    this.confirmed = false;
    this.chosen = null;
    this.slots = [];
    this.step3.reset();
  }
}
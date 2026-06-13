import { Schema, model, InferSchemaType } from 'mongoose';

export const APPT_STATUSES = [
  'booked',
  'checked_in',
  'in_service',
  'completed',
  'cancelled',
  'no_show',
] as const;

export type ApptStatus = (typeof APPT_STATUSES)[number];

const appointmentSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, enum: APPT_STATUSES, default: 'booked' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Speeds up "find this provider's appointments in a time window" — core of availability.
appointmentSchema.index({ provider: 1, start: 1, end: 1 });

export type Appointment = InferSchemaType<typeof appointmentSchema>;
export const AppointmentModel = model('Appointment', appointmentSchema);

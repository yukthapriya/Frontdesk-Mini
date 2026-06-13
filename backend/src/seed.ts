import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from './db';
import { ServiceModel } from './models/Service';
import { ProviderModel } from './models/Provider';
import { AppointmentModel } from './models/Appointment';

// Build a Date at a given hour:minute today.
function at(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function seed(): Promise<void> {
  const MONGO_URI =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frontdesk_mini';
  await connectDb(MONGO_URI);

  await Promise.all([
    ServiceModel.deleteMany({}),
    ProviderModel.deleteMany({}),
    AppointmentModel.deleteMany({}),
  ]);

  const services = await ServiceModel.create([
    { name: 'Express Facial', durationMinutes: 30, price: 55 },
    { name: 'Deep Tissue Massage', durationMinutes: 60, price: 95 },
    { name: 'Hot Stone Therapy', durationMinutes: 90, price: 140 },
  ]);

  const providers = await ProviderModel.create([
    { name: 'Maya Okonkwo', active: true },
    { name: 'Daniel Reyes', active: true },
    { name: 'Priya Nair', active: true },
  ]);

  const [facial, massage, hotstone] = services;
  const [maya, daniel, priya] = providers;

  const mk = (
    customerName: string,
    customerPhone: string,
    svc: (typeof services)[number],
    prov: (typeof providers)[number],
    hour: number,
    minute: number,
    status: string
  ) => {
    const start = at(hour, minute);
    return {
      customerName,
      customerPhone,
      service: svc._id,
      provider: prov._id,
      start,
      end: new Date(start.getTime() + svc.durationMinutes * 60_000),
      status,
    };
  };

  await AppointmentModel.create([
    mk('Renee Park', '555-0101', massage, maya, 9, 0, 'in_service'),
    mk('Tom Alvarez', '555-0102', facial, daniel, 9, 30, 'checked_in'),
    mk('Lena Fox', '555-0103', hotstone, priya, 10, 0, 'booked'),
    mk('Sam Idris', '555-0104', facial, maya, 11, 0, 'completed'),
    mk('Bea Coleman', '555-0105', massage, daniel, 13, 0, 'booked'),
  ]);

  console.log('Seeded services, providers, and sample appointments.');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
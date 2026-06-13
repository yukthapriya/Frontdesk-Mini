import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from './db';
import { ServiceModel } from './models/Service';
import { ProviderModel } from './models/Provider';
import { AppointmentModel } from './models/Appointment';

async function seed(): Promise<void> {
  const MONGO_URI =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frontdesk_mini';
  await connectDb(MONGO_URI);

  await Promise.all([
    ServiceModel.deleteMany({}),
    ProviderModel.deleteMany({}),
    AppointmentModel.deleteMany({}),
  ]);

  await ServiceModel.create([
    { name: 'Express Facial', durationMinutes: 30, price: 55 },
    { name: 'Deep Tissue Massage', durationMinutes: 60, price: 95 },
    { name: 'Hot Stone Therapy', durationMinutes: 90, price: 140 },
  ]);

  await ProviderModel.create([
    { name: 'Maya Okonkwo', active: true },
    { name: 'Daniel Reyes', active: true },
    { name: 'Priya Nair', active: true },
  ]);

  console.log('Seeded services and providers.');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

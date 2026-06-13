import { Schema, model, InferSchemaType } from 'mongoose';

const serviceSchema = new Schema({
  name: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  price: { type: Number, required: true },
});

export type Service = InferSchemaType<typeof serviceSchema>;
export const ServiceModel = model('Service', serviceSchema);

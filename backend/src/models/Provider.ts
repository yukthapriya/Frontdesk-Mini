import { Schema, model, InferSchemaType } from 'mongoose';

// A practitioner who performs services (stylist, therapist, clinician, etc.).
const providerSchema = new Schema({
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
});

export type Provider = InferSchemaType<typeof providerSchema>;
export const ProviderModel = model('Provider', providerSchema);

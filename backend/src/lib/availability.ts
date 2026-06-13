import { AppointmentModel } from '../models/Appointment';
import { ProviderModel } from '../models/Provider';

export interface Slot {
  start: string; // ISO string
  end: string; // ISO string
  providerId: string;
  providerName: string;
}

// Business hours. Pull into config later if you want per-provider hours.
const DAY_START_HOUR = 9; // 9:00 AM
const DAY_END_HOUR = 19; // 7:00 PM
const SLOT_STEP_MIN = 30; // candidate slots start every 30 minutes

// Two time intervals overlap iff each one starts before the other ends.
// This single line is the heart of conflict detection — be ready to explain it.
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Return every open slot on `dateStr` that can fit an appointment of
 * `durationMinutes`. Strategy: load each active provider's appointments for the
 * day ONCE, then walk candidate start times and keep only the ones that
 * (a) finish within business hours and (b) don't overlap any existing
 * appointment for that provider.
 */
export async function getAvailableSlots(
  dateStr: string, // 'YYYY-MM-DD'
  durationMinutes: number,
  providerId?: string
): Promise<Slot[]> {
  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59`);

  const providerFilter = providerId ? { _id: providerId } : {};
  const providers = await ProviderModel.find({ active: true, ...providerFilter });

  // One query for all relevant appointments, instead of querying inside the loop.
  // Cancelled and no-show appointments free the slot back up.
  const appts = await AppointmentModel.find({
    provider: { $in: providers.map((p) => p._id) },
    status: { $nin: ['cancelled', 'no_show'] },
    start: { $lt: dayEnd },
    end: { $gt: dayStart },
  });

  const businessEnd = new Date(`${dateStr}T00:00:00`);
  businessEnd.setHours(DAY_END_HOUR, 0, 0, 0);

  const slots: Slot[] = [];

  for (const provider of providers) {
    const providerAppts = appts.filter(
      (a) => String(a.provider) === String(provider._id)
    );

    const cursor = new Date(`${dateStr}T00:00:00`);
    cursor.setHours(DAY_START_HOUR, 0, 0, 0);

    while (cursor.getTime() <= businessEnd.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);

      const finishesInHours = slotEnd.getTime() <= businessEnd.getTime();
      const conflict = providerAppts.some((a) =>
        overlaps(slotStart, slotEnd, new Date(a.start as Date), new Date(a.end as Date))
      );

      if (finishesInHours && !conflict) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          providerId: String(provider._id),
          providerName: provider.name,
        });
      }

      cursor.setMinutes(cursor.getMinutes() + SLOT_STEP_MIN);
    }
  }

  slots.sort(
    (a, b) =>
      a.start.localeCompare(b.start) || a.providerName.localeCompare(b.providerName)
  );
  return slots;
}

import { Router } from 'express';
import { AppointmentModel, APPT_STATUSES, ApptStatus } from '../models/Appointment';
import { ServiceModel } from '../models/Service';
import { emitApptEvent } from '../socket';

const router = Router();

// Customer booking. Re-checks for a conflict at write time to defend against a
// race where two people grab the same slot between availability check and submit.
router.post('/', async (req, res) => {
  const { customerName, customerPhone, serviceId, providerId, start } = req.body;
  if (!customerName || !customerPhone || !serviceId || !providerId || !start) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const service = await ServiceModel.findById(serviceId);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + service.durationMinutes * 60_000);

  const conflict = await AppointmentModel.findOne({
    provider: providerId,
    status: { $nin: ['cancelled', 'no_show'] },
    start: { $lt: endDate },
    end: { $gt: startDate },
  });
  if (conflict) {
    return res
      .status(409)
      .json({ error: 'That time was just booked. Please pick another slot.' });
  }

  const appt = await AppointmentModel.create({
    customerName,
    customerPhone,
    service: serviceId,
    provider: providerId,
    start: startDate,
    end: endDate,
    status: 'booked',
  });

  const populated = await appt.populate(['service', 'provider']);
  emitApptEvent('appointment:created', populated);
  res.status(201).json(populated);
});

// Front-desk board / schedule: appointments for a given day.
router.get('/', async (req, res) => {
  const { date } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (date) {
    filter.start = {
      $gte: new Date(`${date}T00:00:00`),
      $lte: new Date(`${date}T23:59:59`),
    };
  }
  const appts = await AppointmentModel.find(filter)
    .populate(['service', 'provider'])
    .sort({ start: 1 });
  res.json(appts);
});

// Move an appointment along its lifecycle:
//   booked -> checked_in -> in_service -> completed
// with branches to cancelled / no_show. The frontend decides which
// transitions to offer; the server just validates the target is a real status.
router.patch('/:id/status', async (req, res) => {
  const status = req.body.status as ApptStatus;
  if (!APPT_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const appt = await AppointmentModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate(['service', 'provider']);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  emitApptEvent('appointment:updated', appt);
  res.json(appt);
});

export default router;

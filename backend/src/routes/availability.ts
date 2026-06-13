import { Router } from 'express';
import { ServiceModel } from '../models/Service';
import { getAvailableSlots } from '../lib/availability';

const router = Router();

// GET /api/availability?serviceId=...&date=YYYY-MM-DD&providerId=(optional)
router.get('/', async (req, res) => {
  const { serviceId, date, providerId } = req.query as Record<string, string>;
  if (!serviceId || !date) {
    return res.status(400).json({ error: 'serviceId and date are required' });
  }

  const service = await ServiceModel.findById(serviceId);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const slots = await getAvailableSlots(date, service.durationMinutes, providerId);
  res.json(slots);
});

export default router;

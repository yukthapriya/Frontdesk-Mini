import { Router } from 'express';
import { ServiceModel } from '../models/Service';

const router = Router();

router.get('/', async (_req, res) => {
  const services = await ServiceModel.find().sort({ name: 1 });
  res.json(services);
});

export default router;

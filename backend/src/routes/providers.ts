import { Router } from 'express';
import { ProviderModel } from '../models/Provider';

const router = Router();

router.get('/', async (_req, res) => {
  const providers = await ProviderModel.find({ active: true }).sort({ name: 1 });
  res.json(providers);
});

export default router;

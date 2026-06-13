import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDb } from './db';
import { setIo } from './socket';
import servicesRouter from './routes/services';
import providersRouter from './routes/providers';
import availabilityRouter from './routes/availability';
import appointmentsRouter from './routes/appointments';

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frontdesk_mini';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:4200';

async function main(): Promise<void> {
  await connectDb(MONGO_URI);

  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/services', servicesRouter);
  app.use('/api/providers', providersRouter);
  app.use('/api/availability', availabilityRouter);
  app.use('/api/appointments', appointmentsRouter);

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: CLIENT_ORIGIN } });
  setIo(io);
  io.on('connection', (socket) => {
    console.log('client connected', socket.id);
  });

  server.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

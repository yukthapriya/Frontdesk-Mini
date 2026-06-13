import type { Server } from 'socket.io';

let io: Server | null = null;

export function setIo(server: Server): void {
  io = server;
}

// Routes call this to broadcast a change to every connected front-desk board.
export function emitApptEvent(
  event: 'appointment:created' | 'appointment:updated',
  payload: unknown
): void {
  io?.emit(event, payload);
}

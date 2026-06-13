# Frontdesk Mini — appointment booking & live front desk (MEAN)

A scaled-down booking and front-desk tool for an appointment-based service
business (spa, salon, wellness studio, clinic). Built on the MEAN stack:
**M**ongoDB, **E**xpress, **A**ngular, **N**ode — with TypeScript throughout and
Socket.io for a live front-desk board.

Three flows:
1. **Book** — a customer picks a treatment + date, sees only genuinely open
   times, and confirms. Multi-step Angular reactive form.
2. **Front desk** — an internal board where staff move appointments through
   `booked → checked in → in service → completed`, with a **no-show** branch,
   updating live across all open tabs via Socket.io.
3. **Schedule** — a day view of appointments grouped by provider.

## Why this design (read before the interview)

- **Availability is the real engineering.** `backend/src/lib/availability.ts`
  generates candidate slots and removes any that overlap an existing appointment
  for that provider. The overlap test is one line:
  `slotStart < apptEnd && slotEnd > apptStart`. Know why that's correct.
- **Double-booking is guarded twice** — once when showing slots, and again at
  write time in the booking route (a 409 if the slot was taken in between).
- **It's a real state machine, not a straight line.** Appointments advance
  `booked → checked_in → in_service → completed`, but can branch to `no_show`
  or `cancelled` — and those branches free the slot back up in availability.
  Be ready to walk through the allowed transitions.
- **Mongo modelling choice:** an Appointment *references* Service and Provider by
  ObjectId rather than embedding them, because those records change
  independently and are shared across many appointments. There's an index on
  `{ provider, start, end }` to keep the availability query fast.
- **Intentionally out of scope:** payments, SMS reminders, recurring
  appointments, provider working-hours per day, customer accounts. Left out on
  purpose to keep the project focused — easy to discuss as future work.

---

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB** — either:
  - local via Docker: `docker run -d -p 27017:27017 --name mongo mongo:7`, or
  - a free **MongoDB Atlas** cluster (put its connection string in `backend/.env`)
- **Angular CLI** for the frontend: `npm install -g @angular/cli`

---

## Run the backend

```bash
cd backend
cp .env.example .env        # edit MONGO_URI if you use Atlas
npm install
npm run seed                # loads 3 treatments + 3 providers
npm run dev                 # API on http://localhost:4000
```

Quick check: open http://localhost:4000/health → `{"ok":true}`

## Run the frontend

See `frontend-files/FRONTEND_SETUP.md` for the full steps. Short version:

```bash
ng new frontdesk-mini-frontend   # choose CSS, no SSR
cd frontdesk-mini-frontend
npm install socket.io-client
# copy frontend-files/app/* into src/app/  (see FRONTEND_SETUP.md)
ng serve                         # app on http://localhost:4200
```

## Try the live board

1. Open http://localhost:4200/book and create an appointment.
2. Open http://localhost:4200/frontdesk in **two** browser windows side by side.
3. Advance an appointment in one window — watch it move in the other instantly.
4. Mark one a no-show and watch it drop to the sidelined row.

---

## API reference

| Method | Path                            | Purpose                            |
|--------|---------------------------------|------------------------------------|
| GET    | `/api/services`                 | list treatments                    |
| GET    | `/api/providers`                | list active providers              |
| GET    | `/api/availability`             | open slots (`?serviceId=&date=`)   |
| POST   | `/api/appointments`             | create a booking                   |
| GET    | `/api/appointments?date=`       | appointments for a day             |
| PATCH  | `/api/appointments/:id/status`  | move appointment along lifecycle   |

## Project layout

```
frontdesk-mini/
├── backend/                    # Node + Express + TS + Mongoose + Socket.io
│   └── src/
│       ├── server.ts           # Express + Socket.io wiring
│       ├── db.ts  socket.ts
│       ├── models/             # Service, Provider, Appointment
│       ├── lib/availability.ts # slot generation + conflict detection
│       ├── routes/             # services, providers, availability, appointments
│       └── seed.ts
└── frontend-files/             # Angular sources to drop into an `ng new` scaffold
    ├── FRONTEND_SETUP.md
    └── app/
```

## Deploy (optional, recommended)

Backend → Render web service (set `MONGO_URI` to Atlas, `CLIENT_ORIGIN` to your
frontend URL). Frontend → `ng build`, deploy the `dist/` folder to
Netlify/Vercel, and point `API` in `api.service.ts` / `realtime.service.ts` at
the deployed backend URL.

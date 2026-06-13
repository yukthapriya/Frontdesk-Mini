# Frontend setup (Angular)

These files are **not** a full Angular project — they're the meaningful sources you
drop into a fresh Angular scaffold. Angular needs its own build files (angular.json,
tsconfig, etc.) which the CLI generates for you.

## 1. Install the Angular CLI (once)

```bash
npm install -g @angular/cli
```

## 2. Scaffold the project (from the repo root, NOT inside backend/)

```bash
ng new frontdesk-mini-frontend
```

When prompted:
- **Stylesheet format:** CSS
- **Server-Side Rendering (SSR):** No

Then:

```bash
cd frontdesk-mini-frontend
npm install socket.io-client
```

## 3. Copy the source files in

Copy everything from this `frontend-files/app/` folder into your new project's
`src/app/` folder, overwriting the generated `app.routes.ts`, `app.config.ts`, and
the root component.

Final `src/app/` should look like:

```
src/app/
├── booking/booking.component.ts
├── frontdesk/frontdesk.component.ts
├── schedule/schedule.component.ts
├── api.service.ts
├── realtime.service.ts
├── models.ts
├── app.routes.ts
├── app.config.ts
└── app.component.ts      (or app.ts — see note below)
```

### Root component naming (important)

Angular renamed the generated root component around v19:
- **v18 and earlier:** `app.component.ts`, class `AppComponent`
- **v19+:** `app.ts`, class `App`

Open `src/main.ts` and see which class it bootstraps. Then either:
- keep the provided `app.component.ts` with class `AppComponent` (and make sure
  main.ts imports `AppComponent` from `./app/app.component`), **or**
- paste the `@Component` body from the provided file into your generated root file
  and keep its existing class name.

The template/styles are what matter — match the class name to your project.

## 4. Run it

```bash
ng serve
```

Open http://localhost:4200. Make sure the backend is already running on :4000
(see the top-level README).

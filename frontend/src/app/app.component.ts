import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// NOTE on class name:
//   Angular <= 18 generates this file as app.component.ts with class `AppComponent`.
//   Angular >= 19 may generate app.ts with class `App`.
// Use whichever name your generated main.ts bootstraps. The body below is identical
// either way — only the class name on the next line might differ in your project.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header>
      <h1>Frontdesk Mini</h1>
      <nav>
        <a routerLink="/book" routerLinkActive="active">Book</a>
        <a routerLink="/frontdesk" routerLinkActive="active">Front desk</a>
        <a routerLink="/schedule" routerLinkActive="active">Schedule</a>
      </nav>
    </header>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { font-family: system-ui, sans-serif; }
    header { display: flex; align-items: center; gap: 24px; padding: 12px 20px; border-bottom: 1px solid #eee; }
    h1 { font-size: 18px; margin: 0; }
    nav a { margin-right: 14px; text-decoration: none; color: #374151; }
    nav a.active { color: #2563eb; font-weight: 600; }
    main { padding: 20px; }
  `],
})
export class AppComponent {}

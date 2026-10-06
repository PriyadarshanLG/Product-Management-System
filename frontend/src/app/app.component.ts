import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AdminAuthService } from './core/services/admin-auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Gupio Product Management System';
  isLoginRoute = false;

  constructor(
    private router: Router,
    private auth: AdminAuthService
  ) {
    this.isLoginRoute = this.router.url.startsWith('/login');
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.isLoginRoute = this.router.url.startsWith('/login');
    });
  }

  signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/login']);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="login-shell flex min-h-screen items-center justify-center bg-[#f4f6f3] px-5 py-10">
      <section class="login-card w-full max-w-[420px] rounded-xl border border-[#e3e9e5] bg-white p-7 shadow-[0_12px_36px_rgba(29,48,39,0.08)] sm:p-9">
        <div class="mb-8 flex items-center gap-3">
          <span class="brand-mark flex h-10 w-10 items-center justify-center text-base font-extrabold">G</span>
          <span>
            <span class="block text-lg font-bold text-[#1e2b26]">Gupio</span>
            <span class="block text-xs text-[#77847d]">Inventory workspace</span>
          </span>
        </div>

        <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#718078]">Administrator access</p>
        <h1 class="text-2xl font-bold text-[#1e2b26]">Sign in</h1>
        <p class="mt-1.5 text-sm text-[#67756e]">Use your administrator credentials to continue.</p>

        <form (ngSubmit)="submit()" class="mt-7 space-y-5">
          <label class="block text-sm font-semibold text-[#35443c]">
            Username
            <input
              name="username"
              type="text"
              [(ngModel)]="username"
              autocomplete="username"
              required
              autofocus
              class="mt-1.5 block w-full rounded-lg border border-[#d6dfd9] bg-white px-3.5 py-3 text-sm text-[#1e2b26] outline-none transition focus:border-[#17634c] focus:ring-2 focus:ring-[#17634c]/15"
            />
          </label>

          <label class="block text-sm font-semibold text-[#35443c]">
            Password
            <span class="relative mt-1.5 block">
              <input
                name="password"
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-lg border border-[#d6dfd9] bg-white px-3.5 py-3 pr-16 text-sm text-[#1e2b26] outline-none transition focus:border-[#17634c] focus:ring-2 focus:ring-[#17634c]/15"
              />
              <button
                type="button"
                (click)="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-[#17634c]"
                [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </span>
          </label>

          <p *ngIf="errorMessage" role="alert" class="rounded-lg border border-[#edc9c3] bg-[#fbe9e6] px-3 py-2.5 text-sm text-[#ad4137]">{{ errorMessage }}</p>

          <button
            type="submit"
            [disabled]="isSubmitting || !username.trim() || !password"
            class="w-full rounded-lg bg-[#17634c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#124b3a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ isSubmitting ? 'Signing in...' : 'Sign in to workspace' }}
          </button>
        </form>
      </section>
    </main>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  isSubmitting = false;
  errorMessage = '';
  private readonly returnUrl: string;

  constructor(
    private auth: AdminAuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
    this.returnUrl = requestedUrl.startsWith('/') && !requestedUrl.startsWith('//') ? requestedUrl : '/dashboard';
  }

  submit(): void {
    if (this.isSubmitting || !this.username.trim() || !this.password) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    this.auth.signIn(this.username.trim(), this.password).subscribe({
      next: () => void this.router.navigateByUrl(this.returnUrl),
      error: (error) => {
        this.errorMessage = error.error?.message || 'Unable to sign in. Check your credentials and try again.';
        this.isSubmitting = false;
      },
    });
  }
}
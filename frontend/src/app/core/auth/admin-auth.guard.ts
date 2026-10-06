import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AdminAuthService);
  if (auth.isSignedIn()) return true;

  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const signedOutGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  return auth.isSignedIn() ? inject(Router).createUrlTree(['/dashboard']) : true;
};
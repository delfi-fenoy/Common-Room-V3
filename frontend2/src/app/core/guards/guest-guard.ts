import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService)
  const router = inject(Router)
  // Si el user NO está logueado, devuelve true, sino redirige a home
  return !auth.isLoggedIn() ? true : router.parseUrl('/')
};

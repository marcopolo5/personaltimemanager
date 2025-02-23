import { CanActivateFn, Router } from '@angular/router';
import { TokenSubject } from '../subjects/token.subject';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const tokenSubject = inject(TokenSubject);
  const token = tokenSubject.getToken();

  if (!token) {
    router.navigate(['/login']);
  }
  console.log(token);
  return true;
};

import { CanActivateFn } from '@angular/router';
import { TokenSubject } from '../subjects/token.subject';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const tokenSubject = inject(TokenSubject);
  const token = tokenSubject.getToken();

  return !!token;
};

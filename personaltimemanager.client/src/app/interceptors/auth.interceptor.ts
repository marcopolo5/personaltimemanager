import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { TokenSubject } from '../subjects/token.subject';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  const tokenSubject = inject(TokenSubject);

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${tokenSubject.getToken()}`,
  });

  const clonedRequest = req.clone({ headers });
  return next(clonedRequest);
};

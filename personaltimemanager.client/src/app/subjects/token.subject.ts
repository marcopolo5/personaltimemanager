import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TokenSubject {

  token: string | null = null;

  private tokenSubject: BehaviorSubject<string | null>;

  token$: Observable<string | null>;

  constructor(private cookieService: CookieService) {
    const initialToken = this.getTokenFromCookie();
    this.tokenSubject = new BehaviorSubject<string | null>(initialToken);
    this.token$ = this.tokenSubject.asObservable();
  }

  setToken(token: string | null) {
    this.tokenSubject.next(token);
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    this.cookieService.set('token', JSON.stringify(token), { expires: expirationDate, path: '/' });
  }

  clearToken() {
    this.tokenSubject.next(null);
    this.cookieService.delete('token', '/');
  }

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  private getTokenFromCookie(): string | null {
    if (!this.cookieService) return null;
    const tokenCookie = this.cookieService.get('token');
    return tokenCookie ? JSON.parse(tokenCookie) : null;
  }

}

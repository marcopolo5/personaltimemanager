import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/User';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserSubject {

  DEFAULT_USER: User = {
    uid: '',
    name: '',
    email: '',
    created_at: new Date()
  }

  private userSubject: BehaviorSubject<User>;

  user$: Observable<User>;

  constructor(private cookieService: CookieService) {
    const initialUser = this.getUserFromCookie();
    this.userSubject = new BehaviorSubject<User>(initialUser);
    this.user$ = this.userSubject.asObservable();
  }

  setUser(user: User) {
    this.userSubject.next(user);
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    this.cookieService.set('user', JSON.stringify(user), { expires: expirationDate, path: '/' });
  }

  clearUser() {
    this.userSubject.next({ ...this.DEFAULT_USER });
    this.cookieService.delete('user', '/');
  }

  getUser(): User {
    return this.userSubject.getValue();
  }

  private getUserFromCookie(): User {
    if (!this.cookieService) return { ...this.DEFAULT_USER };
    const userCookie = this.cookieService.get('user');
    return userCookie ? JSON.parse(userCookie) : { ...this.DEFAULT_USER };
  }
}

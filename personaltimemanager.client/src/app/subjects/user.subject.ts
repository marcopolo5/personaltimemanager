import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/User';

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

  private userSubject = new BehaviorSubject<User>({ ...this.DEFAULT_USER });

  user$: Observable<User> = this.userSubject.asObservable();

  setUser(user: User) {
    this.userSubject.next(user);
  }

  clearUser() {
    this.userSubject.next({ ...this.DEFAULT_USER });
  }

  getUser(): User {
    return this.userSubject.getValue();
  }

}

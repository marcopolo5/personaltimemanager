import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import UserPreferences, { DEFAULT_USER_PREFERENCES } from '../models/UserPreferences';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesSubject {

  private userPreferencesSubject: BehaviorSubject<UserPreferences>;

  userPreferences$: Observable<UserPreferences>;

  constructor(private cookieService: CookieService) {
    const initialUserPreferences = this.getUserPreferencesFromCookie();
    this.userPreferencesSubject = new BehaviorSubject<UserPreferences>(initialUserPreferences);
    this.userPreferences$ = this.userPreferencesSubject.asObservable();
  }

  setUserPreferences(userPreferences: UserPreferences) {
    this.userPreferencesSubject.next(userPreferences);
    this.cookieService.set('userPreferences', JSON.stringify(userPreferences), { expires: 30, path: '/' });
  }


  showAllTasks(showAllTasks: boolean) {
    const data = this.getUserPreferences();
    this.setUserPreferences({ ...data, showAllTasks });
  }

  setShowTaskType(value: string) {
    if (!['any', 'completed', 'uncompleted'].includes(value)) {
      return;
    }
    const currentPreferences = this.userPreferencesSubject.getValue();
    const updatedPreferences = { ...currentPreferences, showTaskType: value as 'any' | 'completed' | 'uncompleted' };
    console.log(updatedPreferences);
    this.setUserPreferences(updatedPreferences);

  }

  setSortTasksBy(value: string) {
    if (!['default', 'name-asc', 'name-desc', 'date-asc', 'date-desc'].includes(value)) {
      return;
    }
    const currentPreferences = this.userPreferencesSubject.getValue();
    const updatedPreferences = { ...currentPreferences, sortTasksBy: value as 'default' | 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' };
    console.log(updatedPreferences);
    this.setUserPreferences(updatedPreferences);
  }

  getUserPreferences(): UserPreferences {
    this.userPreferencesSubject.next(this.getUserPreferencesFromCookie());
    return this.userPreferencesSubject.getValue();
  }

  private getUserPreferencesFromCookie(): UserPreferences {
    if (!this.cookieService) return { ...DEFAULT_USER_PREFERENCES };
    const userPreferencesCookie = this.cookieService.get('userPreferences');
    return userPreferencesCookie ? JSON.parse(userPreferencesCookie) : { ...DEFAULT_USER_PREFERENCES };
  }
}

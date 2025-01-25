import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomResponse } from '../models/CustomResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) { }

  register(data: any): Observable<CustomResponse> {
    return this.http.post<CustomResponse>(`${this.apiUrl}/register`, data);
  }


  login(data: any): Observable<CustomResponse> {
    return this.http.post<CustomResponse>(`${this.apiUrl}/login`, data);
  }

}

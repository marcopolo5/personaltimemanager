import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomResponse } from '../models/CustomResponse';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTasksByUserId(userId: string): Observable<CustomResponse> {
    return this.http.get<CustomResponse>(`${this.apiUrl}/Users/${userId}/Tasks`);
  }

  getTaskById(userId: string, taskId: string): Observable<CustomResponse> {
    return this.http.get<CustomResponse>(`${this.apiUrl}/Users/${userId}/Tasks/${taskId}`);
  }

  addTask(userId: string, data: any): Observable<CustomResponse> {
    return this.http.post<CustomResponse>(`${this.apiUrl}/Users/${userId}/Tasks`, data);
  }

  updateTask(userId: string, taskId: string, data: any): Observable<CustomResponse> {
    return this.http.put<CustomResponse>(`${this.apiUrl}/Users/${userId}/Tasks/${taskId}`, data);
  }

  deleteTask(userId: string, taskId: string): Observable<CustomResponse> {
    return this.http.delete<CustomResponse>(`${this.apiUrl}/Users/${userId}/Tasks/${taskId}`);
  }
}

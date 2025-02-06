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

  getTaskById(taskId: string): Observable<CustomResponse> {
    return this.http.get<CustomResponse>(`${this.apiUrl}/Tasks/${taskId}`);
  }

  addTask(data: any): Observable<CustomResponse> {
    return this.http.post<CustomResponse>(`${this.apiUrl}/Tasks`, data);
  }

  updateTask(taskId: string, data: any): Observable<CustomResponse> {
    return this.http.put<CustomResponse>(`${this.apiUrl}/Tasks/${taskId}`, data);
  }

  deleteTask(taskId: string): Observable<CustomResponse> {
    return this.http.delete<CustomResponse>(`${this.apiUrl}/Tasks/${taskId}`);
  }
}

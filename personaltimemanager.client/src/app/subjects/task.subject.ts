import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/Task';

@Injectable({
  providedIn: 'root'
})
export class TaskSubject {


  private tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);

  tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  addTask(task: Task) {
    const tasks = this.tasksSubject.getValue();
    this.tasksSubject.next([...tasks, task]);
  }

  updateTask(task: Task) {
    const tasks = this.tasksSubject.getValue().map(t => t.id === task.id ? task : t);
    this.tasksSubject.next(tasks);
  }

  removeTask(task: Task) {
    const tasks = this.tasksSubject.getValue().filter(t => t.id !== task.id);
    this.tasksSubject.next(tasks);
  }

  setTasks(tasks: Task[]) {
    this.tasksSubject.next(tasks);
  }

  clearTasks() {
    this.tasksSubject.next([]);
  }

  getTask(): Task[] {
    return this.tasksSubject.getValue();
  }
}

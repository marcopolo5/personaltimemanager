import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { TaskService } from '../services/task.service';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { Task } from '../models/Task';
import { UserSubject } from '../subjects/user.subject';
import { User } from '../models/User';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, CardModule],
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.css']
})
export class CalendarDialogComponent {
  selectedDate: string = '';
  tasks: Task[] = [];
  user!: User; // ✅ Added user object

  constructor(public dialog: MatDialog, private taskService: TaskService, private userSubject: UserSubject) {}

  ngOnInit(): void {
    this.user = this.userSubject.getUser(); // ✅ Get the logged-in user
  }

  fetchTasks(): void {
    if (!this.selectedDate || !this.user?.uid) return;
  
    this.taskService.getTasksByDate(this.user.uid, this.selectedDate).subscribe({
      next: (response: { data: Task[] }) => {
        this.tasks = response.data;
      },
      error: (error: any) => {
        console.log('Error fetching tasks:', error);
      }
    });
  }
  

  openTaskDetails(task: Task): void {
    this.dialog.open(TaskDetailComponent, {
      width: '400px',
      data: task
    });
  }
}

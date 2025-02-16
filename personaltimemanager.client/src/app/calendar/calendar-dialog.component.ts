import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  selectedDate: string = new Date().toISOString().split("T")[0];
  tasks: Task[] = [];
  user!: User; 

  constructor(public dialog: MatDialog, private taskService: TaskService, private userSubject: UserSubject, 
    public dialogRef: MatDialogRef<CalendarDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public task: any) {}

  ngOnInit(): void {
    this.user = this.userSubject.getUser(); 
  }

  close(): void {
    this.dialogRef.close();
  }

  onDateChange(): void {
    
    this.taskService.getTasksByDate(this.user.uid, this.selectedDate).subscribe({
      next: (response: { data: Task[] }) => {
        this.tasks = response.data;
        this.close();
      },
      error: (error: any) => {
        console.log('Error fetching tasks:', error);
        this.close();
      }
    });
  }
}

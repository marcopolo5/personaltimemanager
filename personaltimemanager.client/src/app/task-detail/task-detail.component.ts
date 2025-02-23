import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Task } from '../models/Task';
import { finalize } from 'rxjs';
import { CustomResponse } from '../models/CustomResponse';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public task: any,
    private router: Router,
    private taskService: TaskService
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  deleteTask(task: Task): void {
    const confirmed = window.confirm(`Are you sure you want to delete task ${task.name}?`);
    if (!confirmed) {
      return;
    }
    this.taskService.deleteTask(task.userId, task.id).subscribe({
      next: (response: CustomResponse) => {
        this.dialogRef.close('deleted');
      },
      error: (response: HttpErrorResponse) => {
      }
    });
  }

  editTask(taskId: string): void {
    this.dialogRef.close();
    this.router.navigate([`tasks/${taskId}/edit`]);
  }
}

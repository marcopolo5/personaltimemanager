import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  deleteTask(): void {
    console.log('Delete button clicked!');
  }

  editTask(): void {
    this.dialogRef.close(); // Close modal before navigating
    this.router.navigate(['add-task'], { queryParams: { task: JSON.stringify(this.task) } });
  }
}

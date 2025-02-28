import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { UserSubject } from '../subjects/user.subject';
import { User } from '../models/User';
import { DEFAULT_TASK, Task } from '../models/Task';
import { CustomResponse } from '../models/CustomResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-task-form',
  standalone: true,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class TaskFormComponent implements OnInit {

  taskForm: FormGroup = new FormGroup({});
  task: Task = { ...DEFAULT_TASK };
  user!: User;
  errorMessage = '';
  confirmBtnText = 'Confirm';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userSubject: UserSubject) { }

  ngOnInit(): void {
    this.initForm();
    this.user = this.userSubject.getUser();
    const taskId = this.route.snapshot.paramMap.get('taskId') || '';
    if (taskId) {
      this.getTask(taskId);
    }
  }

  getTask(taskId: string) {
    this.taskService.getTaskById(this.user.uid, taskId).subscribe({
      next: (response) => {
        this.task = response.data;
        this.initForm();
      }
    });
  }


  initForm() {
    this.taskForm = this.fb.group({
      name: [this.task.name || '', Validators.required],
      description: [this.task.description || '', Validators.required],
      taskType: [this.task.type || '', Validators.required],
      startDate: [this.task.dates.length === 1 ? '' : this.task.dates[0]],
      deadline: [this.task.dates.at(-1) || '', Validators.required],
      startTime: [this.task.startTime || ''],
      endTime: [this.task.endTime || '', Validators.required],
    });
  }

  onSubmit(): void {
    if (!this.taskForm.valid) {
      return
    }
    const data = {
      Name: this.taskForm.get('name')?.value,
      Description: this.taskForm.get('description')?.value,
      Type: this.taskForm.get('taskType')?.value,
      StartTime: (this.taskForm.get('taskType')?.value === 'one-time' ? null : this.taskForm.get('startTime')?.value) || null,
      EndTime: this.taskForm.get('endTime')?.value || null,
      Dates: this.generateDateList()
    };

    if (this.task.id) {
      this.updateTask(data);
    } else {
      this.addTask(data);
    }

  }


  addTask(data: any) {
    this.errorMessage = '';
    this.confirmBtnText = 'Please wait...';
    this.taskService.addTask(this.user.uid, data)
      .pipe(
        finalize(() => {
          this.confirmBtnText = 'Confirm';
        }))
      .subscribe({
        next: () => {
          this.taskForm.reset();
          this.router.navigate(['/home']);
        },
        error: (response: HttpErrorResponse) => {
          this.errorMessage = response.error.message || 'Failed to connect to server.'
        }
      });
  }

  updateTask(data: any) {
    this.errorMessage = '';
    this.confirmBtnText = 'Please wait...';
    this.taskService.updateTask(this.user.uid, this.task.id, data)
    .pipe(
      finalize(() => {
        this.confirmBtnText = 'Confirm';
      }))
    .subscribe({
      next: () => {
        this.taskForm.reset();
        this.router.navigate(['/home']);
      },
      error: (response) => {
        console.log(response);
      },
    });
  }

  cancel() {
    this.router.navigate(['/']);
  }




  generateDateList() {
    const startDate = this.taskForm.get('startDate')?.value;
    const endDate = this.taskForm.get('deadline')?.value;

    if (!startDate) {
      return [endDate]
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return [];
    }

    const dateList: string[] = [];
    let current = start;

    while (current <= end) {
      dateList.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dateList;
  }



  isValidDateTimeRange(): boolean {

    const taskType = this.taskForm.get('taskType')?.value;
    if (taskType === 'one-time') {
      return true;
    }

    const startDate = this.taskForm.get('startDate')?.value;
    const deadline = this.taskForm.get('deadline')?.value;
    const startTime = this.taskForm.get('startTime')?.value;
    const endTime = this.taskForm.get('endTime')?.value;

    const startDateTime = this.combineDateTime(startDate, startTime);
    const endDateTime = this.combineDateTime(deadline, endTime);

    return startDateTime <= endDateTime;
  }

  combineDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    return new Date(year, month - 1, day, hours, minutes, 0);
  }


}

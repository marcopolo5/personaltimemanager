import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { UserSubject } from '../subjects/user.subject';
import { User } from '../models/User';
import { Task } from '../models/Task';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class AddTaskComponent implements OnInit {
  DEFAULT_TASK: Task = {
    id: '',
    userId: '',
    name: '',
    description: '',
    type: '',
    startTime: '',
    endTime: '',
    dates: [],
    completed: false
  }

  taskForm: FormGroup = new FormGroup({});
  task: Task = { ...this.DEFAULT_TASK };
  user!: User;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userSubject: UserSubject) { }

  ngOnInit(): void {
    this.initForm();
    this.user = this.userSubject.getUser();
    console.log(this.user);
    const taskId = this.route.snapshot.paramMap.get('taskId') || '';
    if (taskId) {
      this.getTask(taskId);
    } else {

    }
  }

  getTask(taskId: string) {
    this.taskService.getTaskById(this.user.uid, taskId).subscribe({
      next: (response) => {
        this.task = response.data;
        this.initForm();
        console.log(response);
      },
      error: (response) => {
        console.log(response);
      },
      complete: () => {
        console.log('completed');
        this.initForm();
      },
    });
  }


  initForm() {
    this.taskForm = this.fb.group({
      name: [this.task.name, Validators.required],
      description: [this.task.description, Validators.required],
      taskType: [this.task.type, Validators.required],
      startDate: [this.task.dates[0]],
      deadline: [this.task.dates.at(-1), Validators.required],
      startTime: [this.task.startTime],
      endTime: [this.task.endTime, Validators.required],
    });

    console.log(this.taskForm.value);
  }

  onSubmit(): void {
    if (!this.taskForm.valid) {
      console.log('Form is invalid');
      return
    }
    const data = {
      Name: this.taskForm.get('name')?.value,
      Description: this.taskForm.get('description')?.value,
      Type: this.taskForm.get('taskType')?.value,
      StartTime: this.taskForm.get('startTime')?.value || null,
      EndTime: this.taskForm.get('endTime')?.value || null,
      Dates: this.generateDateList()
    };

    console.log('Task Submitted:', this.taskForm.value, data, this.user);

    if (this.task.id) {
      this.updateTask(data);
    } else {
      this.addTask(data);
    }

  }


  addTask(data: any) {
    this.taskService.addTask(this.user.uid, data).subscribe({
      next: (response) => {
        console.log(response);
        this.router.navigate(['/home']);
      },
      error: (response) => {
        console.log(response);
      },
      complete: () => {
        this.taskForm.reset();
        console.log('completed...');
      }
    });
  }

  updateTask(data: any) {
    this.taskService.updateTask(this.user.uid, this.task.id, data).subscribe({
      next: (response) => {
        console.log(response);
        this.router.navigate(['/home']);
      },
      error: (response) => {
        console.log(response);
      },
      complete: () => {
        this.taskForm.reset();
        console.log('completed...');
      }
    });
  }

  cancel() {
    this.router.navigate(['/home']);
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

    const startDate = this.taskForm.get('startDate')?.value;
    const deadline = this.taskForm.get('deadline')?.value;
    const startTime = this.taskForm.get('startTime')?.value;
    const endTime = this.taskForm.get('endTime')?.value;

    if (!startDate && !startTime && deadline && endTime) {
      return true;
    }

    if (!startDate || !startTime || !deadline || !endTime) {
      return false;
    }

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

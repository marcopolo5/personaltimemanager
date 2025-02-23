import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { CalendarDialogComponent } from '../calendar/calendar-dialog.component';
import { Router } from '@angular/router';
import { Task } from '../models/Task';
import { TaskService } from '../services/task.service';
import { UserSubject } from '../subjects/user.subject';
import { User } from '../models/User';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomResponse } from '../models/CustomResponse';
import { finalize } from 'rxjs';
import { TokenSubject } from '../subjects/token.subject';

@Component({
  standalone: false,
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  tasks: Task[] = [];
  user!: User;
  selectedDate: string = new Date().toISOString().split("T")[0];
  loadingText = '';
  showTasksByDate: boolean = true;

  constructor(public dialog: MatDialog,
    private router: Router,
    private taskService: TaskService,
    private userSubject: UserSubject,
    private tokenSubject: TokenSubject
  ) { }

  ngOnInit(): void {
    this.user = this.userSubject.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
    }
    this.retrieveTasksByDate();
  }

  retrieveTasksByDate() {
    this.tasks = [];
    this.loadingText = 'Retrieving tasks...';
    this.taskService.getTasksByUserIdAndDate(this.user.uid, this.selectedDate)
      .pipe(finalize(() => {
        this.loadingText = '';
      }))
      .subscribe({
        next: (response: CustomResponse) => {
          this.tasks = response.data;
        },
        error: (response: HttpErrorResponse) => {
          this.tasks = [];
        }
      });
  }

  retrieveAllTasks() {
    this.tasks = [];
    this.loadingText = 'Retrieving tasks...';
    this.taskService.getTasksByUserId(this.user.uid)
      .pipe(finalize(() => {
        this.loadingText = '';
      }))
      .subscribe({
        next: (response: CustomResponse) => {
          this.tasks = response.data;
        },
        error: (response: HttpErrorResponse) => {
          this.tasks = [];
        }
      });
  }

  openTaskDetails(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '400px',
      data: task
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'deleted') {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
      }
    });
  }

  openCalendar(): void {
    this.dialog.open(CalendarDialogComponent, {
      width: '500px'
    });
  }

  onDateChange(): void {
    this.retrieveTasksByDate();
  }

  addTask(): void {
    this.router.navigate(['tasks/new']);
  }

  toggleTaskCompletion(task: Task): void {
    task.completed = !task.completed;
  }

  changeTaskView() {
    this.showTasksByDate = !this.showTasksByDate;
    if (this.showTasksByDate) {
      this.retrieveTasksByDate();
    }
    else {
      this.retrieveAllTasks();
    }
  }

  logout() {
    this.userSubject.clearUser();
    this.tokenSubject.clearToken();
    this.router.navigate(['/login']);
  }
}

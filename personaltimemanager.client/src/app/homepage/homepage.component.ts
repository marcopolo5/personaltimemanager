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
import { TaskSubject } from '../subjects/task.subject';

@Component({
  standalone: false,
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  user!: User;
  selectedDate: string = new Date().toISOString().split("T")[0];
  loadingText = '';
  showTasksByDate: boolean = true;
  sortBy = 'default';
  show = 'any';

  constructor(public dialog: MatDialog,
    private router: Router,
    private taskService: TaskService,
    private tokenSubject: TokenSubject,
    private userSubject: UserSubject,
    private taskSubject: TaskSubject
  ) { }

  ngOnInit(): void {
    this.user = this.userSubject.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
    }

    this.taskSubject.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilters();
    });
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
          this.taskSubject.setTasks(response.data);
        },
        error: (response: HttpErrorResponse) => {
          this.taskSubject.setTasks([]);
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
          this.taskSubject.setTasks(response.data);
          this.tasks = response.data;
        },
        error: (response: HttpErrorResponse) => {
          this.taskSubject.setTasks([]);
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
    this.loadingText = 'Please wait...';
    this.taskService.toggleTaskCompleted(this.user.uid, task.id)
      .pipe(
        finalize(() => {
          this.loadingText = '';
        }))
      .subscribe({
        next: (response: CustomResponse) => {
          this.taskSubject.updateTask(response.data);
        },
        error: (response: HttpErrorResponse) => {
        }
      });
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


  applyFilters() {
    switch (this.show) {
      case 'completed':
        this.filteredTasks = this.tasks.filter(task => task.isCompleted);
        break;
      case 'uncompleted':
        this.filteredTasks = this.tasks.filter(task => !task.isCompleted);
        break;
      default:
        this.filteredTasks = [...this.tasks];
    }

    switch (this.sortBy) {
      case 'name-asc':
        this.filteredTasks = [...this.filteredTasks].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredTasks = [...this.filteredTasks].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date-asc':
        this.filteredTasks = [...this.filteredTasks].sort((a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime());
        break;
      case 'date-desc':
        this.filteredTasks = [...this.filteredTasks].sort((a, b) => new Date(b.dates[0]).getTime() - new Date(a.dates[0]).getTime());
        break;
    }
  }

  sortTasksBy(value: string) {
    this.sortBy = value;
    this.applyFilters();
  }

  filterTasksBy(value: string) {
    this.show = value;
    this.applyFilters();
  }
}

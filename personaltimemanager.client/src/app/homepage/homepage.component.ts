import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { CalendarDialogComponent } from '../calendar/calendar-dialog.component';
import { Router } from '@angular/router';
import { Task } from '../models/Task';
import { TaskService } from '../services/task.service';
import { UserSubject } from '../subjects/user.subject';
import { User } from '../models/User';

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
  
  constructor(public dialog: MatDialog,
    private router: Router,
    private taskService: TaskService,
    private userSubject: UserSubject) { }

  ngOnInit(): void {
    this.user = this.userSubject.getUser();
    this.taskService.getTasksByUserId(this.user.uid).subscribe({
      next: (response) => {
        console.log(response);
        this.tasks = response.data;
      },
      error: (response) => {
        console.log(response);
      },
      complete: () => {
        console.log('completed');
      }
    })
  }

  openTaskDetails(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '400px',
      data: task
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'deleted') {
        console.log('Task deleted successfully!');
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
    
    this.taskService.getTasksByDate(this.user.uid, this.selectedDate).subscribe({
      next: (response: { data: Task[] }) => {
        this.tasks = response.data;
      },
      error: (error: any) => {
        console.log('Error fetching tasks:', error);
      }
    });
  }

  addTask(): void {
    console.log('Add Task Button Clicked!');
    this.router.navigate(['tasks/new']);
  }

  toggleTaskCompletion(task: Task): void {
    task.completed = !task.completed;
  }
}

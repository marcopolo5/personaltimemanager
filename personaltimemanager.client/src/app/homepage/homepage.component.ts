import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
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
  user !: User;

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
    this.dialog.open(TaskDetailComponent, {
      width: '400px',
      data: task
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

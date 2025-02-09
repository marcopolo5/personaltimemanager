import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { Router } from '@angular/router';

interface Task {
  id: string;
  userId: string;
  taskName: string;
  description: string;
  type: 'ongoing' | 'one-time';
  startTime: string;
  endTime: string;
  dates: string[]; 
  completed: boolean;
}

@Component({
  standalone: false,
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  tasks: Task[] = [
    {
      id: '1',
      userId: 'user123',
      taskName: 'Team Meeting',
      description: 'Discuss project updates and next steps.',
      type: 'one-time',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      dates: [new Date().toISOString().split('T')[0]], 
      completed: false
    },
    {
      id: '2',
      userId: 'user456',
      taskName: 'Write Report',
      description: 'Complete the quarterly report for review.',
      type: 'ongoing',
      startTime: '11:00 AM',
      endTime: '01:00 PM',
      dates: ['2025-02-08', '2025-02-09', '2025-02-10'], 
      completed: false
    }
  ];

  constructor(public dialog: MatDialog, private router: Router) {}

  openTaskDetails(task: Task): void {
    this.dialog.open(TaskDetailComponent, {
      width: '400px',
      data: task
    });
  }

  addTask(): void {
    console.log('Add Task Button Clicked!');
    this.router.navigate(['add-task']);
  }

  toggleTaskCompletion(task: Task): void {
    task.completed = !task.completed;
  }
}

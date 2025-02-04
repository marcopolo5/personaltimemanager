import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';

interface Task {
  taskName: string;
  description: string;
  tip: string;
  taskDate: string;
  startDate: string;
  deadline: string;
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
      taskName: 'Team Meeting',
      description: 'Discuss project updates and next steps.',
      tip: 'Prepare an agenda beforehand.',
      taskDate: new Date().toISOString().split('T')[0],
      startDate: '09:00 AM',
      deadline: '10:00 AM',
      completed: false
    },
    {
      taskName: 'Write Report',
      description: 'Complete the quarterly report for review.',
      tip: 'Focus on key performance indicators.',
      taskDate: new Date().toISOString().split('T')[0],
      startDate: '11:00 AM',
      deadline: '01:00 PM',
      completed: false
    }
  ];

  constructor(public dialog: MatDialog) {}

  openTaskDetails(task: Task): void {
    this.dialog.open(TaskDetailComponent, {
      width: '400px',
      data: task
    });
  }

  addTask(): void {
    console.log('Add Task Button Clicked!');
  }
}

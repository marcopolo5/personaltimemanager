import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
  imports: [ReactiveFormsModule]
})
export class AddTaskComponent implements OnInit {
  taskForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private taskService: TaskService) { }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      description: ['', Validators.required],
      tip: [''],
      taskDate: ['', Validators.required],
      startDate: ['', Validators.required],
      deadline: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      console.log('Task Submitted:', this.taskForm.value);
      this.taskService.addTask(this.taskForm.value).subscribe({
        next: (response) => {
          //
          this.router.navigate(['/home']);
        },
        error: (response) => {
          //
        },
        complete: () => {
          console.log('completed...');
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }

  cancel() {
    this.router.navigate(['/home']);
  }
}

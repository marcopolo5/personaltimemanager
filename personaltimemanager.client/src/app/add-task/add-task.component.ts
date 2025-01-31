import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
  imports: [ReactiveFormsModule]
})
export class AddTaskComponent implements OnInit {
  taskForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

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
    } else {
      console.log('Form is invalid');
    }
  }
}

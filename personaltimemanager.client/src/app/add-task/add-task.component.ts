import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class AddTaskComponent implements OnInit {
  taskForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private taskService: TaskService) { }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      description: ['', Validators.required],
      taskType: [''],
      startDate: [''],
      deadline: ['', Validators.required],
      startTime: [''],
      endTime: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {

      const data = {
        Name: this.taskForm.get('taskName')?.value,
        Description: this.taskForm.get('description')?.value,
        Type: this.taskForm.get('taskType')?.value,
        StartTime: this.taskForm.get('startTime')?.value || null,
        EndTime: this.taskForm.get('endTime')?.value || null,
        Dates: this.generateDateList()
      };


      console.log('Task Submitted:', this.taskForm.value, data);
      this.taskService.addTask('janos', data).subscribe({
        next: (response) => {
          //
          this.router.navigate(['/home']);
        },
        error: (response) => {
          //
        },
        complete: () => {
          this.taskForm.reset();
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

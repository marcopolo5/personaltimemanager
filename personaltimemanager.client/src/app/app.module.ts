import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { HomepageComponent } from './homepage/homepage.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';

// Calendar Dialog Component
import { CalendarDialogComponent } from './calendar/calendar-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomepageComponent,
    TaskDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AddTaskComponent,
    CardModule,
    CheckboxModule,
    ButtonModule,
    DialogModule,
    CalendarModule 
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

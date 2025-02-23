import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router} from '@angular/router';
import { UserSubject } from '../subjects/user.subject';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  loginBtnText = 'Login';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private userSubject: UserSubject) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loginBtnText = 'Logging in...';
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);

      this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loginBtnText = 'Login';
        }))
      .subscribe({
        next: (response) => {
          this.userSubject.setUser(response.user);
          console.log(response);
          this.successMessage = response.message;
          this.router.navigate(['/home']);
        },
        error: (response) => {
          this.errorMessage = response.error.message;
          console.log(response);
          this.errorMessage = response.error.message;
        },
        complete: () => {
          console.log('completed');
        }
      })

    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}

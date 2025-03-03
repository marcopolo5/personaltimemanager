import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserSubject } from '../subjects/user.subject';
import { finalize } from 'rxjs';
import { TokenSubject } from '../subjects/token.subject';
import { CustomResponse } from '../models/CustomResponse';
import { HttpErrorResponse } from '@angular/common/http';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userSubject: UserSubject,
    private tokenSubject: TokenSubject,
    private cdr: ChangeDetectorRef
  ) {
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

      this.authService.login(this.loginForm.value)
        .pipe(
          finalize(() => {
            this.loginBtnText = 'Login';
          }))
        .subscribe({
          next: (response: CustomResponse) => {
            this.userSubject.setUser(response.user);
            this.tokenSubject.setToken(response.token);
            this.successMessage = response.message;
            this.router.navigate(['/']);
          },
          error: (response: HttpErrorResponse) => {
            this.errorMessage = response.error.message || 'Failed to connect to server.';
          }
        });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}

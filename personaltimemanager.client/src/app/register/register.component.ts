import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserSubject } from '../subjects/user.subject';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: false,

  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage = '';
  registerBtnText = 'Register';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private userSubject: UserSubject) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.registerBtnText = 'Registering...';
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);

      this.authService.register(this.registerForm.value)
        .pipe(
          finalize(() => {
            this.registerBtnText = 'Register';
          }))
        .subscribe({
          next: (response) => {
            this.userSubject.setUser(response.user);
            console.log(response);
            this.router.navigate(['/home']);
          },
          error: (response) => {
            this.errorMessage = response.error.message;
            console.log(response);
          },
          complete: () => {
            console.log('completed');
          }
        })

    }
  }


  validatePassword(): boolean {
    const password = this.registerForm.get('password')?.value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  }

  passwordsMatch() {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  isBtnDisabled() {
    return this.registerForm.invalid || !this.passwordsMatch() || !this.validatePassword();
  }
}

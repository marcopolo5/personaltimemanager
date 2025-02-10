import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserSubject } from '../subjects/user.subject';

@Component({
  selector: 'app-register',
  standalone: false,

  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private userSubject: UserSubject) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.userSubject.setUser(response.user);
          this.successMessage = response.message;
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
      });
    }
  }

  passwordsMatch() {
    return this.registerForm.get('password')?.value === this.registerForm.get('confirmPassword')?.value;
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { UserSubject } from '../subjects/user.subject';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private userSubject: UserSubject) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.userSubject.setUser(response.user);
          console.log(response);
          this.router.navigate(['/home']);
        },
        error: (response) => {
          console.log(response);
        },
        complete: () => {
          console.log('completed');
        }
      })

    }
  }
}

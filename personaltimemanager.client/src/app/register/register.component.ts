import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserSubject } from '../subjects/user.subject';
import { finalize } from 'rxjs';
import { TokenSubject } from '../subjects/token.subject';
import { CustomResponse } from '../models/CustomResponse';
import { HttpErrorResponse } from '@angular/common/http';

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
  registerBtnText = 'Register';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userSubject: UserSubject,
    private tokenSubject: TokenSubject
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }


  onSubmit() {
    this.registerBtnText = 'Registering...';
    this.errorMessage = '';
    if (this.registerForm.valid) {

      this.authService.register(this.registerForm.value)
        .pipe(
          finalize(() => {
            this.registerBtnText = 'Register';
          }))
        .subscribe({
          next: (response: CustomResponse) => {
            this.userSubject.setUser(response.user);
            this.tokenSubject.setToken(response.token);
            this.router.navigate(['/']);
          },
          error: (response: HttpErrorResponse) => {
            this.errorMessage = response.error.message || 'Failed to connect to server.';
          }
        });

    }
  }


  isValidPassword(): boolean {
    return this.hasAtLeastEightCharacters()
      && this.hasAtLeastOneSmallLetter()
      && this.hasAtLeastOneCapitalLetter()
      && this.hasAtLeastOneNumber()
      && this.hasAtLeastOneSpecialCharacter();
  }


  hasAtLeastEightCharacters() {
    const password = this.registerForm.get('password')?.value;
    return password.length >= 8;
  }

  hasAtLeastOneSmallLetter() {
    const password = this.registerForm.get('password')?.value;
    const passwordRegex = /[a-z]/;
    return passwordRegex.test(password);
  }


  hasAtLeastOneNumber(): boolean {
    const password = this.registerForm.get('password')?.value;
    const passwordRegex = /\d/;
    return passwordRegex.test(password);
  }


  hasAtLeastOneSpecialCharacter(): boolean {
    const password = this.registerForm.get('password')?.value;
    const passwordRegex = /[\W]/;
    return passwordRegex.test(password);
  }


  hasAtLeastOneCapitalLetter() {
    const password = this.registerForm.get('password')?.value;
    const passwordRegex = /[A-Z]/;
    return passwordRegex.test(password);
  }

  passwordsMatch() {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  isBtnDisabled() {
    return this.registerForm.invalid || !this.passwordsMatch() || !this.isValidPassword();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  getPasswordValidationClass(fn: () => boolean) {
    return { 'success--text': fn(), 'error--text': !fn() }
  }

  getIconValidationClass(fn: () => boolean) {
    return { 'bi-check-lg': fn(), 'bi-x-lg': !fn() }
  }


}

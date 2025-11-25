import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Welcome back to Replate!', 'Close', { duration: 3000 });
        const role = this.authService.getRole();
        console.log('User role:', role);

        if (role === 'ADMIN') {
          console.log('Redirecting to admin dashboard');
          this.router.navigate(['/dashboard/admin/users']);
        } else if (role === 'MERCHANT') {
          console.log('Redirecting to announcements dashboard');
          this.router.navigate(['/dashboard/announcements']);
        } else {
          console.log('Redirecting to browse page');
          this.router.navigate(['/browse']);
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Invalid credentials. Please try again.', 'Close', { duration: 4000 });
      }
    });
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}

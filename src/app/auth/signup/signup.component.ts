import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signupForm: FormGroup;
  isSubmitting = false;
  uploadingField: 'documentUrl' | null = null;

  roles = [
    { key: 'INDIVIDUAL', label: 'Individual', description: 'Register to donate, receive, or volunteer' },
    { key: 'MERCHANT', label: 'Merchant', description: 'Share surplus items easily' },
    { key: 'ASSOCIATION', label: 'Association', description: 'Coordinate pickups and beneficiaries' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      role: ['INDIVIDUAL', Validators.required],
      username: ['', Validators.required], // Changé de fullName/organizationName
      email: ['', [Validators.required, Validators.email]],
      location: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      documentUrl: [''], // Changé de verificationDocumentUrl
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  selectRole(role: string): void {
    this.signupForm.patchValue({ role });
    // Pas besoin de changer les champs, username est universel
  }

  onFileSelected(event: Event, control: 'documentUrl'): void {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) {
      return;
    }
    const file = target.files[0];
    this.uploadingField = control;
    this.fileService.upload(file, 'DOCUMENT').subscribe({
      next: (res) => {
        console.log('Upload response:', res);
        console.log('Response url:', res?.url);
        this.signupForm.patchValue({ [control]: res.url });
        this.uploadingField = null;
        this.snackBar.open('File uploaded successfully', 'Close', { duration: 2500 });
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.uploadingField = null;
        this.snackBar.open('Unable to upload file. Try again.', 'Close', { duration: 3000 });
      }
    });
  }

  submit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'Close', { duration: 3000 });
      return;
    }

    const payload = { ...this.signupForm.value };
    delete payload.confirmPassword;
    
    this.isSubmitting = true;

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Account created! Please login.', 'Close', { duration: 3500 });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 409) {
          this.snackBar.open('User already exists. Please login.', 'Close', { duration: 4000 });
        } else {
          this.snackBar.open('Registration failed. Please review your data.', 'Close', { duration: 4000 });
        }
      }
    });
  }
}

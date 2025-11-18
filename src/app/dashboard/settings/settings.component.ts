import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  profileForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private snackBar: MatSnackBar) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      tel: ['', Validators.required],
      localisation: ['', Validators.required]
    });
  }

  save(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Profile updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Update failed', 'Close', { duration: 3000 });
      }
    });
  }
}

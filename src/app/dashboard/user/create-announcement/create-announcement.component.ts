import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnnouncementService } from '../../../services/announcement.service';
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'app-create-announcement',
  templateUrl: './create-announcement.component.html',
  styleUrl: './create-announcement.component.scss'
})
export class CreateAnnouncementComponent {
  announcementForm: FormGroup;
  isSubmitting = false;
  uploading = false;
  categories = ['Baked Goods', 'Groceries', 'Cooked Meals', 'Drinks'];
  units = ['Kg', 'Items', 'Meals'];
  types = ['FREE', 'PAID'];

  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      category: ['Baked Goods', Validators.required],
      quantity: [10, Validators.required],
      unit: ['Kg', Validators.required],
      expirationDate: ['', Validators.required],
      pickupAddress: ['', Validators.required],
      imageUrl: [''],
      contactNumber: ['', Validators.required],
      type: ['FREE', Validators.required],
      pricePerUnit: [null]
    });
  }

  submit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }
    if (this.announcementForm.value.type === 'FREE') {
      this.announcementForm.patchValue({ pricePerUnit: null });
    }
    this.isSubmitting = true;
    this.announcementService.create(this.announcementForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Announcement created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/announcements']);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Unable to create announcement', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/announcements']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    this.uploading = true;
    this.fileService.upload(file, 'IMAGE').subscribe({
      next: (res) => {
        this.announcementForm.patchValue({ imageUrl: res.url });
        this.uploading = false;
        this.snackBar.open('Image uploaded', 'Close', { duration: 2000 });
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Upload failed', 'Close', { duration: 3000 });
      }
    });
  }
}

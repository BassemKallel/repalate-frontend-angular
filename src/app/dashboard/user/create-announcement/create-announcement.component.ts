import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AnnouncementService } from '../../../services/announcement.service';
import { FileService } from '../../../services/file.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-create-announcement',
  templateUrl: './create-announcement.component.html',
  styleUrl: './create-announcement.component.scss'
})
export class CreateAnnouncementComponent implements OnInit {
  announcementForm: FormGroup;
  isSubmitting = false;
  uploading = false;
  isEditMode = false;
  announcementId: number | null = null;

  categories = [
    { value: 'FRUITS_VEGETABLES', label: 'Fruits et Légumes' },
    { value: 'BAKERY', label: 'Boulangerie' },
    { value: 'DAIRY', label: 'Produits laitiers' },
    { value: 'PREPARED_MEALS', label: 'Plats préparés' },
    { value: 'MEAT_FISH', label: 'Viande et Poisson' },
    { value: 'GROCERY', label: 'Épicerie' },
    { value: 'OTHER', label: 'Autre' }
  ];
  units = [
    { value: 'KG', label: 'Kilogrammes' },
    { value: 'G', label: 'Grammes' },
    { value: 'L', label: 'Litres' },
    { value: 'PIECE', label: 'Pièce/Unité' },
    { value: 'PACK', label: 'Paquet' }
  ];
  types = [
    { value: 'SALE', label: 'Vente' },
    { value: 'DONATION', label: 'Don' }
  ];

  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['BAKERY', Validators.required],
      stock: [10, Validators.required],
      unit: ['KG', Validators.required],
      expiryDate: ['', Validators.required],
      imageUrl1: [''],
      announcementType: ['DONATION', Validators.required],
      price: [0]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.announcementId = +params['id'];
        this.loadAnnouncement(this.announcementId);
      }
    });
  }

  loadAnnouncement(id: number): void {
    this.announcementService.getById(id.toString()).subscribe({
      next: (announcement) => {
        this.announcementForm.patchValue({
          title: announcement.title,
          category: announcement.category,
          description: announcement.description,
          stock: announcement.stock,
          unit: announcement.unit,
          expiryDate: new Date(announcement.expiryDate),
          imageUrl1: announcement.imageUrl1,
          announcementType: announcement.announcementType,
          price: announcement.price
        });
      },
      error: () => {
        this.snackBar.open('Error loading announcement', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/announcements']);
      }
    });
  }

  submit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('You must be logged in', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.announcementForm.value;

    if (formValue.announcementType === 'DONATION') {
      formValue.price = 0;
    }

    const payload = {
      ...formValue,
      merchantId: currentUser.id,
      expiryDate: this.formatExpiryDate(new Date(formValue.expiryDate))
    };

    console.log('Current User:', currentUser);
    console.log('Payload:', payload);

    this.isSubmitting = true;

    if (this.isEditMode && this.announcementId) {
      this.announcementService.update(this.announcementId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snackBar.open('Announcement updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/announcements']);
        },
        error: () => {
          this.isSubmitting = false;
          this.snackBar.open('Unable to update announcement', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.announcementService.create(payload).subscribe({
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
  }

  private formatExpiryDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}T23:59:59`;
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
        this.announcementForm.patchValue({ imageUrl1: res.url });
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

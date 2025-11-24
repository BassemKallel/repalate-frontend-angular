import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Announcement } from '../../../shared/models/announcement';
import { AnnouncementService } from '../../../services/announcement.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface RelatedOffer {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcement-details.component.html',
  styleUrl: './announcement-details.component.scss'
})
export class AnnouncementDetailsComponent implements OnInit {
  announcement?: Announcement;
  loading = true;
  isPublicView = false;
  reservationQuantity = 1;
  similarAnnouncements: Announcement[] = [];
  relatedOffers: RelatedOffer[] = [
    {
      id: '1',
      name: 'Ahmed Ben Salem',
      avatar: 'https://i.pravatar.cc/120?img=5',
      role: 'Individual'
    },
    {
      id: '2',
      name: 'Nour Association',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Association'
    }
  ];

  categories: string[] = [
    'BAKERY',
    'FRUITS_VEGETABLES',
    'DAIRY',
    'PREPARED_MEALS',
    'MEAT_FISH',
    'GROCERY',
    'OTHER'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Detect if viewing from public route
    this.isPublicView = !this.router.url.includes('/dashboard');

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAnnouncement(id);
    }
  }

  reserve(): void {
    if (!this.announcement || this.reservationQuantity < 1 || this.reservationQuantity > this.announcement.stock) {
      this.snackBar.open('Invalid quantity', 'Close', { duration: 3000 });
      return;
    }

    this.snackBar.open(`Reservation for ${this.reservationQuantity} ${this.announcement.unit} submitted!`, 'Close', {
      duration: 3000
    });
  }

  loadAnnouncement(id: string): void {
    this.loading = true;
    this.announcementService.getById(id).subscribe({
      next: (announcement) => {
        this.announcement = announcement;
        this.loading = false;

        // Load similar announcements if in public view
        if (this.isPublicView && announcement.category) {
          this.loadSimilarAnnouncements(announcement.category, id);
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Announcement not found', 'Close', { duration: 3000 });
      }
    });
  }

  loadSimilarAnnouncements(category: string, currentId: string): void {
    this.announcementService.getAll().subscribe({
      next: (announcements) => {
        this.similarAnnouncements = announcements
          .filter(a => a.category === category && a.id.toString() !== currentId)
          .slice(0, 3); // Limit to 3 similar products
      },
      error: () => {
        console.error('Failed to load similar announcements');
      }
    });
  }

  edit(): void {
    if (this.announcement) {
      this.router.navigate(['/dashboard/announcements/edit', this.announcement.id]);
    }
  }

  delete(): void {
    if (!this.announcement) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Announcement',
        message: `Are you sure you want to delete "${this.announcement.title}"?`,
        confirmLabel: 'Delete',
        danger: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.announcement) {
        this.announcementService.delete(this.announcement.id).subscribe({
          next: () => {
            this.snackBar.open('Announcement deleted', 'Close', { duration: 2500 });
            this.router.navigate(['/dashboard/announcements']);
          },
          error: () => this.snackBar.open('Unable to delete announcement', 'Close', { duration: 3000 })
        });
      }
    });
  }

  openOffer(offer: RelatedOffer, action: 'accept' | 'decline'): void {
    this.snackBar.open(`${offer.name} ${action === 'accept' ? 'accepted' : 'declined'}`, 'Close', {
      duration: 2000
    });
  }

  getStatusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'completed':
        return 'status success';
      case 'pending':
        return 'status warning';
      case 'deleted':
      case 'rejected':
        return 'status danger';
      default:
        return 'status neutral';
    }
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'BAKERY': 'cake',
      'FRUITS_VEGETABLES': 'spa',
      'DAIRY': 'local_cafe',
      'PREPARED_MEALS': 'restaurant_menu',
      'MEAT_FISH': 'outdoor_grill',
      'GROCERY': 'local_grocery_store',
      'OTHER': 'kitchen'
    };
    return icons[category] || 'fastfood';
  }

  getTypeIcon(type: string): string {
    return type === 'DONATION' ? 'volunteer_activism' : 'shopping_cart';
  }

  getImagePlaceholder(category: string): string {
    const colors: { [key: string]: string } = {
      'BAKERY': '#FFE5B4',
      'FRUITS_VEGETABLES': '#C1E1C1',
      'DAIRY': '#F0E68C',
      'PREPARED_MEALS': '#FFB6C1',
      'MEAT_FISH': '#FFB347',
      'GROCERY': '#DDA0DD',
      'OTHER': '#E0E0E0'
    };
    return colors[category] || '#F5F5F5';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'BAKERY': 'Bakery',
      'FRUITS_VEGETABLES': 'Fruits & Vegetables',
      'DAIRY': 'Dairy',
      'PREPARED_MEALS': 'Prepared Meals',
      'MEAT_FISH': 'Meat & Fish',
      'GROCERY': 'Grocery',
      'OTHER': 'Other'
    };
    return labels[category] || category;
  }

  viewSimilarProduct(id: number): void {
    if (this.isPublicView) {
      this.router.navigate(['/announcement', id]);
    } else {
      this.router.navigate(['/dashboard/announcements', id]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

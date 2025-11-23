import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Announcement } from '../../../shared/models/announcement';
import { AnnouncementService } from '../../../services/announcement.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-announcements-list',
  templateUrl: './announcements-list.component.html',
  styleUrl: './announcements-list.component.scss'
})
export class AnnouncementsListComponent implements OnInit {
  displayedColumns = ['image', 'id', 'title', 'category', 'quantity', 'type', 'expirationDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Announcement>([]);
  isMerchant = false;
  loading = true;
  statusFilter = 'all';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isMerchant = this.authService.getRole() === 'MERCHANT';
    this.fetchAnnouncements();
  }

  fetchAnnouncements(): void {
    this.loading = true;
    const request$ = this.isMerchant ? this.announcementService.getMyOffers() : this.announcementService.getAll();
    request$.subscribe({
      next: (announcements) => {
        console.log('API Response:', announcements);

        const mappedAnnouncements: Announcement[] = announcements.map((a: any) => ({
            id: a.id,
            title: a.title || '-',
            category: a.category || '-',
            quantity: a.quantity || '-',
            unit: a.unit || '-',
            expirationDate: a.expirationDate || null,
            pickupAddress: a.pickupAddress || '-',
            imageUrl: a.imageUrl || 'https://placehold.co/60x60',
            contactNumber: a.contactNumber || '-',
            type: a.type || '-',
            status: a.status || 'Pending',
            pricePerUnit: a.pricePerUnit || null,
            createdAt: a.createdAt || '',
            merchantName: a.merchantName || ''
          }));

        this.dataSource = new MatTableDataSource(mappedAnnouncements);
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Unable to load announcements', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value?.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  setStatusFilter(filter: string): void {
    this.statusFilter = filter;
    this.dataSource.filterPredicate = (data) => {
      if (filter === 'all') {
        return true;
      }
      return data.status?.toLowerCase() === filter;
    };
    this.dataSource.filter = Math.random().toString(); // trigger predicate
  }

  createAnnouncement(): void {
    this.router.navigate(['/dashboard/announcements/create']);
  }

  viewDetails(announcement: Announcement): void {
    this.router.navigate(['/dashboard/announcements', announcement.id]);
  }

  deleteAnnouncement(announcement: Announcement): void {
    if (!confirm(`Delete announcement ${announcement.title}?`)) {
      return;
    }
    this.announcementService.delete(announcement.id).subscribe({
      next: () => {
        this.snackBar.open('Announcement deleted', 'Close', { duration: 2500 });
        this.fetchAnnouncements();
      },
      error: () => this.snackBar.open('Unable to delete announcement', 'Close', { duration: 3000 })
    });
  }

  getStatusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'status success';
      case 'pending':
        return 'status warning';
      case 'deleted':
        return 'status danger';
      default:
        return 'status neutral';
    }
  }
}

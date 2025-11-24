import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Announcement } from '../../../shared/models/announcement';
import { AnnouncementService } from '../../../services/announcement.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-announcements-list',
  templateUrl: './announcements-list.component.html',
  styleUrl: './announcements-list.component.scss'
})
export class AnnouncementsListComponent implements OnInit {
  displayedColumns = ['id', 'title', 'category', 'stock', 'type', 'expiryDate', 'moderationStatus', 'actions'];
  dataSource = new MatTableDataSource<Announcement>([]);
  isMerchant = false;
  loading = true;
  statusFilter = 'all';
  categoryFilter = 'all';

  categories = [
    { value: 'FRUITS_VEGETABLES', label: 'Fruits et Légumes' },
    { value: 'BAKERY', label: 'Boulangerie' },
    { value: 'DAIRY', label: 'Produits laitiers' },
    { value: 'PREPARED_MEALS', label: 'Plats préparés' },
    { value: 'MEAT_FISH', label: 'Viande et Poisson' },
    { value: 'GROCERY', label: 'Épicerie' },
    { value: 'OTHER', label: 'Autre' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isMerchant = this.authService.getRole() === 'MERCHANT';
    this.fetchAnnouncements();
    this.setupFilterPredicate();
  }

  fetchAnnouncements(): void {
    this.loading = true;
    const request$ = this.isMerchant ? this.announcementService.getMyOffers() : this.announcementService.getAll();
    request$.subscribe({
      next: (announcements) => {
        this.dataSource = new MatTableDataSource(announcements);
        this.dataSource.filterPredicate = this.createFilterPredicate();
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
    this.updateFilter();
  }

  setCategoryFilter(filter: string): void {
    this.categoryFilter = filter;
    this.updateFilter();
  }

  private updateFilter(): void {
    this.dataSource.filter = JSON.stringify({
      status: this.statusFilter,
      category: this.categoryFilter
    });
  }

  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (data: Announcement, filter: string) => {
      let searchTerms = { status: 'all', category: 'all' };
      try {
        searchTerms = JSON.parse(filter);
      } catch (e) {
        return true;
      }

      const matchesStatus = searchTerms.status === 'all' || data.moderationStatus?.toLowerCase() === searchTerms.status;
      const matchesCategory = searchTerms.category === 'all' || data.category === searchTerms.category;

      return matchesStatus && matchesCategory;
    };
  }

  private createFilterPredicate() {
    return (data: Announcement, filter: string) => {
      // Handle simple string filter (search)
      if (!filter.startsWith('{')) {
        const searchStr = filter.toLowerCase();
        return (
          data.title.toLowerCase().includes(searchStr) ||
          data.id.toString().includes(searchStr) ||
          data.category.toLowerCase().includes(searchStr)
        );
      }

      // Handle complex filter object
      let searchTerms = { status: 'all', category: 'all' };
      try {
        searchTerms = JSON.parse(filter);
      } catch (e) {
        return true;
      }

      const matchesStatus = searchTerms.status === 'all' || data.moderationStatus?.toLowerCase() === searchTerms.status;
      const matchesCategory = searchTerms.category === 'all' || data.category === searchTerms.category;

      return matchesStatus && matchesCategory;
    };
  }

  createAnnouncement(): void {
    this.router.navigate(['/dashboard/announcements/create']);
  }

  viewDetails(announcement: Announcement): void {
    this.router.navigate(['/dashboard/announcements', announcement.id]);
  }

  editAnnouncement(announcement: Announcement): void {
    this.router.navigate(['/dashboard/announcements/edit', announcement.id]);
  }

  deleteAnnouncement(announcement: Announcement): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Announcement',
        message: `Are you sure you want to delete "${announcement.title}"?`,
        confirmLabel: 'Delete',
        danger: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.announcementService.delete(announcement.id).subscribe({
          next: () => {
            this.snackBar.open('Announcement deleted', 'Close', { duration: 2500 });
            this.fetchAnnouncements();
          },
          error: () => this.snackBar.open('Unable to delete announcement', 'Close', { duration: 3000 })
        });
      }
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

  getTotalCount(): number {
    return this.dataSource.data.length;
  }

  getAcceptedCount(): number {
    return this.dataSource.data.filter(a => a.moderationStatus?.toLowerCase() === 'accepted').length;
  }

  getPendingCount(): number {
    return this.dataSource.data.filter(a => !a.moderationStatus || a.moderationStatus.toLowerCase() === 'pending').length;
  }

  getDeletedCount(): number {
    return this.dataSource.data.filter(a => a.moderationStatus?.toLowerCase() === 'deleted').length;
  }

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }
}

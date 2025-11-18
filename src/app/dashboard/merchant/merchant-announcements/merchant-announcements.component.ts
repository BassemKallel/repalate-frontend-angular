import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Announcement } from '../../../shared/models/announcement';
import { AnnouncementService } from '../../../services/announcement.service';

@Component({
  selector: 'app-merchant-announcements',
  templateUrl: './merchant-announcements.component.html',
  styleUrls: ['./merchant-announcements.component.scss']
})
export class MerchantAnnouncementsComponent implements OnInit {
  displayedColumns = ['image', 'title', 'category', 'quantity', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Announcement>([]);
  loading = true;
  statusFilter = 'all';
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private announcementService: AnnouncementService,
    public router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getMyOffers().subscribe({
      next: (announcements) => {
        this.dataSource.data = announcements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error loading announcements', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    if (this.statusFilter !== 'all') {
      this.dataSource.filterPredicate = (data: Announcement) => {
        const searchTerm = this.searchTerm.trim().toLowerCase();
        const matchesStatus = data.status?.toLowerCase() === this.statusFilter.toLowerCase();
        const matchesSearch = data.title?.toLowerCase().includes(searchTerm) || 
                             (data as any)?.description?.toLowerCase().includes(searchTerm);
        return matchesStatus && matchesSearch;
      };
    } else {
      this.dataSource.filterPredicate = (data: Announcement) => {
        const searchTerm = this.searchTerm.trim().toLowerCase();
        return data.title?.toLowerCase().includes(searchTerm) || 
               (data as any)?.description?.toLowerCase().includes(searchTerm);
      };
    }
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.applyFilter();
  }

  viewDetails(announcement: Announcement): void {
    this.router.navigate(['/dashboard/merchant/announcements', announcement.id]);
  }

  editAnnouncement(announcement: Announcement): void {
    this.router.navigate(['/dashboard/announcements/create'], { 
      queryParams: { edit: announcement.id } 
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-unknown';
    switch (status.toLowerCase()) {
      case 'published':
        return 'status-published';
      case 'draft':
        return 'status-draft';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-unknown';
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  deleteAnnouncement(announcement: Announcement): void {
    if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      this.announcementService.delete(announcement.id).subscribe({
        next: () => {
          this.snackBar.open('Announcement deleted', 'Close', { duration: 3000 });
          this.loadAnnouncements();
        },
        error: () => {
          this.snackBar.open('Error deleting announcement', 'Close', { duration: 3000 });
        }
      });
    }
  }


}

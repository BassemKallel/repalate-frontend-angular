import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../auth/auth.service';
import { AnnouncementService } from '../../../services/announcement.service';
import { Announcement } from '../../../shared/models/announcement';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface AdminAnnouncement {
  id: string;
  title: string;
  owner: string;
  createdAt: string;
  publishedAt: string;
  status: 'Pending' | 'Review' | 'Accepted';
  originalId: number;
}

@Component({
  selector: 'app-admin-announcements',
  templateUrl: './admin-announcements.component.html',
  styleUrls: ['./admin-announcements.component.scss']
})
export class AdminAnnouncementsComponent implements OnInit, AfterViewInit {
  announcements: AdminAnnouncement[] = [];

  displayedColumns = ['id', 'title', 'owner', 'createdAt', 'publishedAt', 'status', 'actions'];
  dataSource = new MatTableDataSource<AdminAnnouncement>([]);
  filterText = '';
  statusFilter: 'all' | AdminAnnouncement['status'] = 'all';
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  showCreateButton = false;

  constructor(
    private authService: AuthService,
    private announcementService: AnnouncementService,
    private dialog: MatDialog
  ) {
    this.showCreateButton = this.authService.hasRole(['MERCHANT']);
  }

  ngOnInit(): void {
    this.configureFilter();
    this.loadAnnouncements();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilters(): void {
    const normalizedStatus = this.statusFilter === 'all' ? 'all' : this.statusFilter.toLowerCase();
    this.dataSource.filter = JSON.stringify({
      text: this.filterText.trim().toLowerCase(),
      status: normalizedStatus
    });
  }

  clearFilters(): void {
    this.filterText = '';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  getStatusClass(status: AdminAnnouncement['status']): string {
    switch (status) {
      case 'Accepted':
        return 'status success';
      case 'Review':
        return 'status warning';
      case 'Pending':
      default:
        return 'status neutral';
    }
  }

  private loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getAll().subscribe({
      next: (announcements) => {
        this.announcements = announcements.map((item, index) => this.mapToAdminAnnouncement(item, index));
        this.dataSource.data = this.announcements;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private mapToAdminAnnouncement(item: Announcement, index: number): AdminAnnouncement {
    const numericId = typeof item.id === 'number' ? item.id : Number(item.id);
    const originalId = Number.isFinite(numericId) ? numericId : index + 1;
    return {
      id: item.id ? `ANN-${item.id}` : `ANN-${(index + 1).toString().padStart(4, '0')}`,
      title: item.title || 'Annonce sans titre',
      owner: item.merchantName || 'Equipe RePlate',
      createdAt: item.createdAt ? this.formatDate(item.createdAt) : 'Date inconnue',
      publishedAt: item.createdAt ? this.formatDate(item.createdAt) : 'Date inconnue',
      status: this.mapStatus(item.status),
      originalId
    };
  }

  private mapStatus(status?: Announcement['status']): AdminAnnouncement['status'] {
    switch (status) {
      case 'Approved':
        return 'Accepted';
      case 'Deleted':
        return 'Review';
      default:
        return 'Pending';
    }
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private configureFilter(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const parsed = filter ? JSON.parse(filter) : {};
      const criteria = {
        text: '',
        status: 'all',
        ...parsed
      } as { text: string; status: 'all' | string };
      const matchesText = !criteria.text ||
        data.title.toLowerCase().includes(criteria.text) ||
        data.owner.toLowerCase().includes(criteria.text) ||
        data.id.toLowerCase().includes(criteria.text);
      const matchesStatus = criteria.status === 'all' || data.status.toLowerCase() === criteria.status;
      return matchesText && matchesStatus;
    };
  }

  confirmDelete(announcement: AdminAnnouncement): void {
    const announcementTitle = announcement.title || 'Annonce sans titre';
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer l\'annonce',
        message: `Confirmez-vous la suppression de « ${announcementTitle} » ?`,
        confirmLabel: 'Supprimer',
        cancelLabel: 'Annuler',
        danger: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.deleteAnnouncement(announcement);
    });
  }

  private deleteAnnouncement(announcement: AdminAnnouncement): void {
    if (!announcement.originalId) {
      return;
    }

    this.loading = true;
    this.announcementService.delete(announcement.originalId).subscribe({
      next: () => this.loadAnnouncements(),
      error: () => {
        this.loading = false;
      }
    });
  }
}

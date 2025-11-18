import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Announcement } from '../../../shared/models/announcement';
import { AnnouncementService } from '../../../services/announcement.service';

interface StatCard {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-donations-list',
  templateUrl: './donations-list.component.html',
  styleUrl: './donations-list.component.scss'
})
export class DonationsListComponent implements OnInit {
  displayedColumns = ['id', 'donor', 'association', 'type', 'quantity', 'createdAt', 'status'];
  dataSource = new MatTableDataSource<Announcement>([]);
  stats: StatCard[] = [];
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.loading = true;
    this.announcementService.getAll().subscribe({
      next: (announcements) => {
        this.dataSource = new MatTableDataSource(announcements);
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
        this.stats = this.computeStats(announcements);
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  computeStats(announcements: Announcement[]): StatCard[] {
    const total = announcements.length;
    const completed = announcements.filter((a) => a.status === 'Completed').length;
    const pending = announcements.filter((a) => a.status === 'Pending').length;
    const cancelled = announcements.filter((a) => a.status === 'Deleted').length;
    return [
      { label: 'Total Donations', value: total, color: '#fde1e3' },
      { label: 'Completed Donations', value: completed, color: '#d7f5dc' },
      { label: 'Pending Requests', value: pending, color: '#e0f0ff' },
      { label: 'Cancelled Donations', value: cancelled, color: '#fbe5ff' }
    ];
  }

  getStatusClass(status?: string): string {
    if (status === 'Completed') {
      return 'status success';
    }
    if (status === 'Pending') {
      return 'status warning';
    }
    return 'status danger';
  }
}

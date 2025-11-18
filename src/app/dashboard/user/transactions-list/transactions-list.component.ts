import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AnnouncementService } from '../../../services/announcement.service';
import { Announcement } from '../../../shared/models/announcement';

interface TransactionRow {
  transactionId: string;
  announcementId: number;
  type: string;
  quantity: string;
  date: string;
  status: 'Pending' | 'Transacted' | 'Cancelled';
}

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.scss'
})
export class TransactionsListComponent implements OnInit {
  displayedColumns = ['transactionId', 'announcementId', 'type', 'quantity', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<TransactionRow>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.announcementService.getMyOffers().subscribe({
      next: (announcements) => {
        const rows = this.mapToTransactions(announcements);
        this.dataSource = new MatTableDataSource(rows);
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private mapToTransactions(announcements: Announcement[]): TransactionRow[] {
    return announcements.map((announcement, index) => ({
      transactionId: `TN-${(index + 1).toString().padStart(3, '0')}`,
      announcementId: announcement.id,
      type: announcement.type === 'FREE' ? 'Free' : 'Paid',
      quantity: `${announcement.quantity} ${announcement.unit}`,
      date: announcement.createdAt ?? new Date().toISOString(),
      status: (announcement.status as TransactionRow['status']) || 'Transacted'
    }));
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Transacted':
        return 'status success';
      case 'Cancelled':
        return 'status danger';
      default:
        return 'status warning';
    }
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentService, Transaction } from '../../../services/payment.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.scss'
})
export class TransactionsListComponent implements OnInit {
  displayedColumns = ['paymentId', 'amount', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<Transaction>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.paymentService.getMyPayments().subscribe({
      next: (transactions) => {
        this.dataSource = new MatTableDataSource(transactions);
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

  getStatusClass(status: string): string {
    const s = status?.toUpperCase();
    switch (s) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'status-success';
      case 'FAILED':
      case 'CANCELLED':
        return 'status-danger';
      case 'PENDING':
        return 'status-warning';
      default:
        return 'status-default';
    }
  }

  getTotalCount(): number {
    return this.dataSource.data.length;
  }

  getCompletedCount(): number {
    return this.dataSource.data.filter(t => t.status === 'COMPLETED' || t.status === 'SUCCESS').length;
  }

  getPendingCount(): number {
    return this.dataSource.data.filter(t => t.status === 'PENDING').length;
  }

  getCancelledCount(): number {
    return this.dataSource.data.filter(t => t.status === 'CANCELLED' || t.status === 'FAILED').length;
  }
}

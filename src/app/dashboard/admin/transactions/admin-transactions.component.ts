import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PaymentService, Transaction } from '../../../services/payment.service';
import { forkJoin } from 'rxjs';
import { ReservationService } from '../../../services/reservation.service';
import { UserService } from '../../../services/user.service';

interface AdminTransaction {
  ref: string;
  applicant: string;
  association: string;
  status: 'En cours' | 'Terminée' | 'Annulée';
}

@Component({
  selector: 'app-admin-transactions',
  templateUrl: './admin-transactions.component.html',
  styleUrls: ['./admin-transactions.component.scss']
})
export class AdminTransactionsComponent implements AfterViewInit, OnInit {
  transactions: AdminTransaction[] = [];

  displayedColumns: string[] = ['ref', 'applicant', 'association', 'status', 'actions'];
  dataSource = new MatTableDataSource<AdminTransaction>([]);
  filterText = '';
  statusFilter: 'all' | AdminTransaction['status'] = 'all';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private paymentService: PaymentService,
    private reservationService: ReservationService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.configureFilter();
  }

  loadTransactions(): void {
    forkJoin({
      payments: this.paymentService.getAllPayments(),
      reservations: this.reservationService.getAdminHistory(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: ({ payments, reservations, users }) => {
        console.log('Data loaded:', { payments, reservations, users });

        this.transactions = payments.map(payment => {
          const reservation = reservations.find(r => r.transactionId === payment.transactionId);
          const user = users.find(u => u.id === reservation?.userId);

          return {
            ref: payment.providerPaymentId || `PAY-${payment.paymentId}`,
            applicant: user ? user.username : `User ${reservation?.userId || 'Unknown'}`,
            association: reservation?.announcementTitle || 'N/A',
            status: this.mapStatus(payment.status)
          };
        });

        this.dataSource.data = this.transactions;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading data:', err)
    });
  }

  mapStatus(status: string): 'En cours' | 'Terminée' | 'Annulée' {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Terminée';
      case 'PENDING': return 'En cours';
      case 'CANCELLED': return 'Annulée';
      default: return 'En cours';
    }
  }

  getTotalCount(): number {
    return this.transactions.length;
  }

  getCompletedCount(): number {
    return this.transactions.filter(t => t.status === 'Terminée').length;
  }

  getPendingCount(): number {
    return this.transactions.filter(t => t.status === 'En cours').length;
  }

  getCancelledCount(): number {
    return this.transactions.filter(t => t.status === 'Annulée').length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Terminée':
        return 'transacted';
      case 'En cours':
        return 'pending';
      case 'Annulée':
        return 'cancelled';
      default:
        return 'pending';
    }
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

  private configureFilter(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const parsed = filter ? JSON.parse(filter) : {};
      const criteria = { text: '', status: 'all', ...parsed } as {
        text: string;
        status: 'all' | string;
      };

      const matchesText = !criteria.text ||
        data.ref.toLowerCase().includes(criteria.text) ||
        data.applicant.toLowerCase().includes(criteria.text) ||
        data.association.toLowerCase().includes(criteria.text);

      const matchesStatus =
        criteria.status === 'all' || data.status.toLowerCase() === criteria.status;

      return matchesText && matchesStatus;
    };
  }
}

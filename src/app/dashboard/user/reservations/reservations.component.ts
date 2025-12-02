import { Component, OnInit } from '@angular/core';
import { Reservation, ReservationService, TransactionStatus } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaymentDialogComponent } from '../../../shared/components/payment-dialog/payment-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'announcement', 'date', 'price', 'status', 'actions'];
  dataSource = new MatTableDataSource<Reservation>([]);
  loading = true;

  // Filters
  searchControl = new FormControl('');
  statusControl = new FormControl('');
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  readonly TransactionStatus = TransactionStatus;
  readonly statusOptions = Object.values(TransactionStatus);

  constructor(
    private reservationService: ReservationService,
    public authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.setupFilterPredicate();
    this.loadReservations();

    // Subscribe to filter changes
    this.searchControl.valueChanges.subscribe(value => {
      this.dataSource.filter = JSON.stringify({ search: value });
    });

    this.statusControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.dateRange.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  get isIndividual(): boolean {
    return this.authService.getRole() === 'INDIVIDUAL';
  }

  get isMerchant(): boolean {
    return this.authService.getRole() === 'MERCHANT';
  }

  loadReservations(): void {
    this.loading = true;
    const request$ = this.authService.getRole() === 'ADMIN'
      ? this.reservationService.getAdminHistory()
      : this.reservationService.getMyHistory();

    request$.subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
        this.applyFilters(); // Re-apply filters on reload
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.loading = false;
      }
    });
  }

  setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: Reservation, filter: string) => {
      const searchFilter = this.searchControl.value?.toLowerCase() || '';
      const statusFilter = this.statusControl.value;
      const start = this.dateRange.value.start;
      const end = this.dateRange.value.end;

      // Text Search
      const matchesSearch = !searchFilter ||
        data.transactionId.toString().includes(searchFilter) ||
        data.announcementTitle.toLowerCase().includes(searchFilter);

      // Status Filter
      const matchesStatus = !statusFilter || data.status === statusFilter;

      // Date Filter
      let matchesDate = true;
      if (start && end) {
        const date = new Date(data.transactionDate);
        matchesDate = date >= start && date <= end;
      } else if (start) {
        const date = new Date(data.transactionDate);
        matchesDate = date >= start;
      }

      return matchesSearch && matchesStatus && matchesDate;
    };
  }

  applyFilters() {
    // Trigger filter update. The value doesn't matter as we use controls in predicate
    this.dataSource.filter = 'trigger';
  }

  clearFilters() {
    this.searchControl.setValue('');
    this.statusControl.setValue('');
    this.dateRange.reset();
  }

  getStatusClass(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.CONFIRMED: return 'status-confirmed';
      case TransactionStatus.PENDING_PAYMENT: return 'status-pending-payment';
      case TransactionStatus.PENDING_CONFIRMATION: return 'status-pending';
      case TransactionStatus.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  }

  onAccept(reservation: Reservation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Accepter la réservation',
        message: `Êtes-vous sûr de vouloir accepter la réservation #${reservation.transactionId} pour "${reservation.announcementTitle}" ?`,
        confirmLabel: 'Accepter',
        cancelLabel: 'Annuler',
        danger: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser?.id) {
          console.error('Unable to get merchant ID');
          return;
        }

        this.reservationService.confirm(reservation.transactionId, currentUser.id).subscribe({
          next: () => {
            this.loadReservations();
          },
          error: (err) => console.error('Error accepting reservation:', err)
        });
      }
    });
  }

  onRefuse(reservation: Reservation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Refuser la réservation',
        message: `Êtes-vous sûr de vouloir refuser la réservation #${reservation.transactionId} pour "${reservation.announcementTitle}" ?`,
        confirmLabel: 'Refuser',
        cancelLabel: 'Annuler',
        danger: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationService.refuse(reservation.transactionId).subscribe({
          next: () => {
            this.loadReservations();
          },
          error: (err) => console.error('Error refusing reservation:', err)
        });
      }
    });
  }

  onPay(reservation: Reservation): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        transactionId: reservation.transactionId,
        announcementTitle: reservation.announcementTitle,
        price: reservation.price,
        paymentClientSecret: reservation.paymentClientSecret
      },
      disableClose: true,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Payment successful, notify backend
        this.reservationService.pay(reservation.transactionId).subscribe({
          next: () => {
            this.loadReservations();
          },
          error: (err) => console.error('Error updating payment status:', err)
        });
      }
    });
  }

  onCancel(reservation: Reservation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Annuler la réservation',
        message: `Êtes-vous sûr de vouloir annuler la réservation #${reservation.transactionId} pour "${reservation.announcementTitle}" ?`,
        confirmLabel: 'Annuler la réservation',
        cancelLabel: 'Retour',
        danger: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationService.cancel(reservation.transactionId).subscribe({
          next: () => {
            this.loadReservations();
          },
          error: (err) => console.error('Error cancelling reservation:', err)
        });
      }
    });
  }
  onDeliver(reservation: Reservation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la livraison',
        message: `Confirmer la livraison de la commande #${reservation.transactionId} ?`,
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
        danger: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationService.deliver(reservation.transactionId).subscribe({
          next: () => {
            this.loadReservations();
          },
          error: (err) => console.error('Error confirming delivery:', err)
        });
      }
    });
  }
}

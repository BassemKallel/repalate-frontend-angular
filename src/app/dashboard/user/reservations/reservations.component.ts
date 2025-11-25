import { Component, OnInit } from '@angular/core';
import { Reservation, ReservationService, TransactionStatus } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'announcement', 'date', 'price', 'status', 'actions'];
  reservations: Reservation[] = [];
  loading = true;

  constructor(
    private reservationService: ReservationService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadReservations();
  }

  get isIndividual(): boolean {
    return this.authService.getRole() === 'INDIVIDUAL';
  }

  loadReservations(): void {
    this.loading = true;
    const request$ = this.authService.getRole() === 'ADMIN'
      ? this.reservationService.getAdminHistory()
      : this.reservationService.getMyHistory();

    request$.subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.COMPLETED: return 'status-completed';
      case TransactionStatus.PENDING:
      case TransactionStatus.PENDING_CONFIRMATION: return 'status-pending';
      case TransactionStatus.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  }

  onAccept(reservation: Reservation): void {
    if (confirm('Are you sure you want to accept this reservation?')) {
      this.reservationService.accept(reservation.transactionId).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (err) => console.error('Error accepting reservation:', err)
      });
    }
  }

  onRefuse(reservation: Reservation): void {
    if (confirm('Are you sure you want to refuse this reservation?')) {
      this.reservationService.refuse(reservation.transactionId).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (err) => console.error('Error refusing reservation:', err)
      });
    }
  }

  onPay(reservation: Reservation): void {
    // Implement payment logic here, possibly redirecting to a payment page or opening a dialog

    this.reservationService.pay(reservation.transactionId).subscribe({
      next: () => {
        alert('Payment successful!');
        this.loadReservations();
      },
      error: (err) => console.error('Error processing payment:', err)
    });
  }

  onCancel(reservation: Reservation): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.reservationService.cancel(reservation.transactionId).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (err) => console.error('Error cancelling reservation:', err)
      });
    }
  }
}

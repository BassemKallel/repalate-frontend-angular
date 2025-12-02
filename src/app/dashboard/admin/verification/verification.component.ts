import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../shared/models/user';
import { UserService } from '../../../services/user.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  pendingAccounts: User[] = [];
  loading = true;
  selectedStatus: 'all' | 'merchant' | 'association' = 'all';

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadPendingAccounts();
  }

  loadPendingAccounts(): void {
    this.loading = true;
    this.userService.getPendingAccounts().subscribe({
      next: (users) => {
        this.pendingAccounts = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Unable to load pending verifications.', 'Close', { duration: 3000 });
      }
    });
  }

  filteredAccounts(): User[] {
    if (this.selectedStatus === 'all') {
      return this.pendingAccounts;
    }
    return this.pendingAccounts.filter((user) => user.role === this.selectedStatus.toUpperCase());
  }

  getTotalCount(): number {
    return this.pendingAccounts.length;
  }

  getMerchantsCount(): number {
    return this.pendingAccounts.filter(u => u.role === 'MERCHANT').length;
  }

  getAssociationsCount(): number {
    return this.pendingAccounts.filter(u => u.role === 'ASSOCIATION').length;
  }

  approve(user: User): void {
    this.confirm({
      title: 'Approve account',
      message: `Approve ${user.username}?`,
      confirmLabel: 'Approve'
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.userService.validateUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`${user.username} has been approved`, 'Close', { duration: 2500 });
          this.loadPendingAccounts();
        },
        error: () => this.snackBar.open('Unable to approve user.', 'Close', { duration: 3000 })
      });
    });
  }

  reject(user: User): void {
    this.confirm({
      title: 'Reject account',
      message: `Reject ${user.username}?`,
      confirmLabel: 'Reject'
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.userService.rejectUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`${user.username} has been rejected`, 'Close', { duration: 2500 });
          this.loadPendingAccounts();
        },
        error: () => this.snackBar.open('Unable to reject user.', 'Close', { duration: 3000 })
      });
    });
  }

  private confirm(data: ConfirmDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        cancelLabel: 'Cancel',
        ...data
      }
    });
    return dialogRef.afterClosed().toPromise();
  }
}

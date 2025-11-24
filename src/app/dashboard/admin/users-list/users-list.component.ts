import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../shared/models/user';
import { UserService } from '../../../services/user.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  displayedColumns = ['user', 'phoneNumber', 'joinDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  pendingUsers: User[] = [];
  loading = true;
  filterText = '';
  roleFilter: 'all' | User['role'] = 'all';
  statusFilter: 'all' | 'Active' | 'Inactive' = 'all';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.configureFilter();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const normalized: User[] = users.map((user) => ({
          ...user,
          fullName: user.fullName || (user as any).username || 'Unknown user',
          joinDate: user.joinDate || (user as any).createdAt || new Date().toISOString(),
          status: user.status || ((user as any).validated === false ? 'Inactive' : 'Active'),
          email: user.email || (user as any).username || 'No email'
        } as User));
        this.dataSource = new MatTableDataSource(normalized);
        this.configureFilter();
        this.applyFilters();
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
        this.loading = false;
      },
      error: () => (this.loading = false)
    });

    this.userService.getPendingAccounts().subscribe({
      next: (users) => (this.pendingUsers = users)
    });
  }

  validate(user: User): void {
    this.userService.validateUser(user.id).subscribe({
      next: () => {
        this.snackBar.open(`${user.fullName} validated`, 'Close', { duration: 2000 });
        this.loadUsers();
      }
    });
  }

  delete(user: User): void {
    this.confirm({
      title: 'Supprimer l’utilisateur',
      message: `Confirmer la suppression de ${user.fullName}?`,
      confirmLabel: 'Supprimer',
      danger: true
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé', 'Close', { duration: 2000 });
          this.loadUsers();
        }
      });
    });
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Inactive':
      default:
        return 'status-inactive';
    }
  }

  getTotalCount(): number {
    return this.dataSource.data.length;
  }

  getActiveCount(): number {
    return this.dataSource.data.filter(u => u.status === 'Active').length;
  }

  getInactiveCount(): number {
    return this.dataSource.data.filter(u => u.status === 'Inactive' || !u.status).length;
  }

  getMerchantsCount(): number {
    return this.dataSource.data.filter(u => u.role === 'MERCHANT').length;
  }

  applyFilters(): void {
    const normalizedRole = this.roleFilter === 'all' ? 'all' : this.roleFilter.toLowerCase();
    const normalizedStatus = this.statusFilter === 'all' ? 'all' : this.statusFilter.toLowerCase();
    this.dataSource.filter = JSON.stringify({
      text: this.filterText.trim().toLowerCase(),
      role: normalizedRole,
      status: normalizedStatus
    });
  }

  clearFilters(): void {
    this.filterText = '';
    this.roleFilter = 'all';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  private configureFilter(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const parsed = filter ? JSON.parse(filter) : {};
      const criteria = {
        text: '',
        role: 'all',
        status: 'all',
        ...parsed
      };
      const name = data.fullName?.toLowerCase() ?? '';
      const email = data.email?.toLowerCase() ?? '';
      const location = data.location?.toLowerCase() ?? '';
      const role = data.role?.toLowerCase() ?? '';
      const status = data.status?.toLowerCase() ?? '';
      const matchesText = !criteria.text || name.includes(criteria.text) || email.includes(criteria.text) || location.includes(criteria.text);
      const matchesRole = criteria.role === 'all' || role === criteria.role;
      const matchesStatus = criteria.status === 'all' || status === criteria.status;
      return matchesText && matchesRole && matchesStatus;
    };
  }

  private confirm(data: ConfirmDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { cancelLabel: 'Annuler', ...data }
    });
    return dialogRef.afterClosed().toPromise();
  }
}

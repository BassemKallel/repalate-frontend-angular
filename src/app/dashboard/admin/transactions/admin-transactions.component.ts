import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

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
export class AdminTransactionsComponent implements AfterViewInit {
  transactions: AdminTransaction[] = [
    { ref: 'TRX-1023', applicant: 'Marché Central', association: 'AidAction', status: 'En cours' },
    { ref: 'TRX-1022', applicant: 'BioFarm', association: 'Entraide 92', status: 'Terminée' },
    { ref: 'TRX-1019', applicant: 'Coop Soleil', association: 'Solidarité Lyon', status: 'Annulée' }
  ];

  displayedColumns: string[] = ['ref', 'applicant', 'association', 'status', 'actions'];
  dataSource = new MatTableDataSource<AdminTransaction>(this.transactions);
  filterText = '';
  statusFilter: 'all' | AdminTransaction['status'] = 'all';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.configureFilter();
    this.applyFilters();
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

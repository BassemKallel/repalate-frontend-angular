import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { UserService } from '../../../services/user.service';
import { AnnouncementService } from '../../../services/announcement.service';
import { PaymentService } from '../../../services/payment.service';
import { ReservationService } from '../../../services/reservation.service';
import { forkJoin } from 'rxjs';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalMerchants: number;
  totalIndividuals: number;
  totalAssociations: number;
  totalAnnouncements: number;
  activeAnnouncements: number;
  pendingAnnouncements: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingVerifications: number;
}

@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.scss']
})
export class AdminStatsComponent implements OnInit {
  stats: AdminStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalMerchants: 0,
    totalIndividuals: 0,
    totalAssociations: 0,
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    pendingAnnouncements: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingVerifications: 0
  };

  loading = true;

  // Charts
  usersEvolutionChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  usersEvolutionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Nouveaux Utilisateurs (12 mois)' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  usersRoleChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  usersRoleChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Utilisateurs par Rôle' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  transactionsChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  transactionsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Transactions par Mois' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  announcementsStatusChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  announcementsStatusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' },
      title: { display: true, text: 'Annonces par Statut' }
    }
  };

  categoriesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  categoriesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Activité par Catégorie' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  constructor(
    private userService: UserService,
    private announcementService: AnnouncementService,
    private paymentService: PaymentService,
    private reservationService: ReservationService
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    forkJoin({
      users: this.userService.getAllUsers(),
      announcements: this.announcementService.getAll(),
      transactions: this.paymentService.getAllPayments(),
      reservations: this.reservationService.getAdminHistory()
    }).subscribe({
      next: ({ users, announcements, transactions, reservations }) => {
        this.calculateStats(users, announcements, transactions);
        this.prepareCharts(users, announcements, transactions);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading admin stats:', err);
        this.loading = false;
      }
    });
  }

  calculateStats(users: any[], announcements: any[], transactions: any[]): void {
    this.stats.totalUsers = users.length;
    this.stats.activeUsers = users.filter(u => this.isActiveThisMonth(u)).length;
    this.stats.totalMerchants = users.filter(u => u.role === 'MERCHANT').length;
    this.stats.totalIndividuals = users.filter(u => u.role === 'INDIVIDUAL').length;
    this.stats.totalAssociations = users.filter(u => u.role === 'ASSOCIATION').length;
    this.stats.totalAnnouncements = announcements.length;
    this.stats.activeAnnouncements = announcements.filter(a =>
      a.status === 'ACCEPTED' && !this.isExpired(a)
    ).length;
    this.stats.pendingAnnouncements = announcements.filter(a =>
      a.status === 'PENDING' || a.status === 'REVIEW'
    ).length;
    this.stats.totalTransactions = transactions.length;
    this.stats.totalRevenue = transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    this.stats.pendingVerifications = users.filter(u => u.status === 'PENDING').length;
  }

  prepareCharts(users: any[], announcements: any[], transactions: any[]): void {
    // Users evolution
    const usersMonthly = this.getMonthlyUsers(users, 12);
    this.usersEvolutionChartData = {
      labels: usersMonthly.labels,
      datasets: [{
        label: 'Nouveaux utilisateurs',
        data: usersMonthly.data,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    // Users by role
    const roleData = this.getUsersByRole(users);
    this.usersRoleChartData = {
      labels: roleData.labels,
      datasets: [{
        label: 'Utilisateurs',
        data: roleData.data,
        backgroundColor: ['#FFC107', '#4CAF50', '#2196F3', '#F44336']
      }]
    };

    // Transactions evolution
    const transactionsMonthly = this.getMonthlyTransactions(transactions, 12);
    this.transactionsChartData = {
      labels: transactionsMonthly.labels,
      datasets: [{
        label: 'Transactions',
        data: transactionsMonthly.data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    // Announcements by status
    const statusData = this.getAnnouncementsByStatus(announcements);
    this.announcementsStatusChartData = {
      labels: statusData.labels,
      datasets: [{
        data: statusData.data,
        backgroundColor: ['#FFC107', '#4CAF50', '#F44336', '#9E9E9E']
      }]
    };

    // Categories
    const categoriesData = this.getCategoryCounts(announcements);
    this.categoriesChartData = {
      labels: categoriesData.labels,
      datasets: [{
        label: 'Annonces',
        data: categoriesData.data,
        backgroundColor: '#FFC107'
      }]
    };
  }

  getMonthlyUsers(users: any[], months: number): { labels: string[], data: number[] } {
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      labels.push(monthName);

      const count = users.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate.getMonth() === date.getMonth() &&
          userDate.getFullYear() === date.getFullYear();
      }).length;
      data.push(count);
    }

    return { labels, data };
  }

  getUsersByRole(users: any[]): { labels: string[], data: number[] } {
    const roles = ['MERCHANT', 'INDIVIDUAL', 'ASSOCIATION', 'ADMIN'];
    const labels = ['Marchands', 'Particuliers', 'Associations', 'Admins'];
    const data = roles.map(role => users.filter(u => u.role === role).length);

    return { labels, data };
  }

  getMonthlyTransactions(transactions: any[], months: number): { labels: string[], data: number[] } {
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      labels.push(monthName);

      const count = transactions.filter(t => {
        const txDate = new Date(t.createdAt);
        return txDate.getMonth() === date.getMonth() &&
          txDate.getFullYear() === date.getFullYear();
      }).length;
      data.push(count);
    }

    return { labels, data };
  }

  getAnnouncementsByStatus(announcements: any[]): { labels: string[], data: number[] } {
    const statusMap = new Map<string, number>();

    announcements.forEach(a => {
      const status = a.status || 'UNKNOWN';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const labels: string[] = [];
    const data: number[] = [];

    statusMap.forEach((count, status) => {
      labels.push(this.formatStatus(status));
      data.push(count);
    });

    return { labels, data };
  }

  getCategoryCounts(announcements: any[]): { labels: string[], data: number[] } {
    const categoryMap = new Map<string, number>();

    announcements.forEach(a => {
      const category = a.category || 'Autre';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sorted.map(([cat]) => cat),
      data: sorted.map(([, count]) => count)
    };
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'En attente',
      'REVIEW': 'En révision',
      'ACCEPTED': 'Acceptée',
      'REJECTED': 'Rejetée'
    };
    return statusMap[status] || status;
  }

  isActiveThisMonth(user: any): boolean {
    if (!user.lastLoginAt) return false;
    const lastLogin = new Date(user.lastLoginAt);
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return lastLogin >= monthAgo;
  }

  isExpired(announcement: any): boolean {
    if (!announcement.expiryDate) return false;
    return new Date(announcement.expiryDate) < new Date();
  }
}

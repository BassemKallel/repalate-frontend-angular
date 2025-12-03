import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReservationService } from '../../../services/reservation.service';
import { FavoriteService } from '../../../services/favorite.service';
import { AnnouncementService } from '../../../services/announcement.service';
import { AuthService } from '../../../services/auth.service';
import { forkJoin, of } from 'rxjs';

interface UserStats {
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  totalSavings: number;
  totalFavorites: number;
}

interface MerchantStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  pendingAnnouncements: number;
  totalReservations: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {
  userStats: UserStats = {
    totalReservations: 0,
    activeReservations: 0,
    completedReservations: 0,
    totalSavings: 0,
    totalFavorites: 0
  };

  merchantStats: MerchantStats = {
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    pendingAnnouncements: 0,
    totalReservations: 0,
    totalRevenue: 0
  };

  loading = true;
  userRole: string = '';
  isMerchant = false;

  // Chart configurations
  evolutionChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  evolutionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Évolution (6 derniers mois)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  distributionChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  distributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      },
      title: {
        display: true,
        text: 'Répartition'
      }
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
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Par Catégorie'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  constructor(
    private reservationService: ReservationService,
    private favoriteService: FavoriteService,
    private announcementService: AnnouncementService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userRole = user.role;
        this.isMerchant = user.role === 'MERCHANT';
        this.loadStats();
      }
    });
  }

  loadStats(): void {
    this.loading = true;

    if (this.isMerchant) {
      this.loadMerchantStats();
    } else {
      this.loadUserStats();
    }
  }

  loadUserStats(): void {
    forkJoin({
      reservations: this.reservationService.getMyHistory(),
      favorites: this.favoriteService.getMyFavorites()
    }).subscribe({
      next: ({ reservations, favorites }) => {
        this.calculateUserStats(reservations, favorites);
        this.prepareUserCharts(reservations);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user stats:', err);
        this.loading = false;
      }
    });
  }

  loadMerchantStats(): void {
    forkJoin({
      announcements: this.announcementService.getMyOffers(),
      reservations: this.reservationService.getMyHistory()
    }).subscribe({
      next: ({ announcements, reservations }) => {
        this.calculateMerchantStats(announcements, reservations);
        this.prepareMerchantCharts(announcements, reservations);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading merchant stats:', err);
        this.loading = false;
      }
    });
  }

  calculateUserStats(reservations: any[], favorites: any): void {
    this.userStats.totalReservations = reservations.length;
    this.userStats.activeReservations = reservations.filter(r =>
      r.status === 'CONFIRMED' || r.status === 'PENDING_PAYMENT'
    ).length;
    this.userStats.completedReservations = reservations.filter(r =>
      r.status === 'COMPLETED'
    ).length;
    this.userStats.totalSavings = reservations
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    this.userStats.totalFavorites = (favorites.announcements?.length || 0) +
      (favorites.merchants?.length || 0);
  }

  calculateMerchantStats(announcements: any[], reservations: any[]): void {
    this.merchantStats.totalAnnouncements = announcements.length;
    this.merchantStats.activeAnnouncements = announcements.filter(a =>
      a.status === 'ACCEPTED' && !this.isExpired(a)
    ).length;
    this.merchantStats.pendingAnnouncements = announcements.filter(a =>
      a.status === 'PENDING' || a.status === 'REVIEW'
    ).length;
    this.merchantStats.totalReservations = reservations.length;
    this.merchantStats.totalRevenue = reservations
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  }

  prepareUserCharts(reservations: any[]): void {
    const monthsData = this.getMonthlyData(reservations, 6);
    this.evolutionChartData = {
      labels: monthsData.labels,
      datasets: [{
        label: 'Réservations',
        data: monthsData.data,
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    const statusCounts = this.getStatusCounts(reservations);
    this.distributionChartData = {
      labels: statusCounts.labels,
      datasets: [{
        data: statusCounts.data,
        backgroundColor: ['#FFC107', '#4CAF50', '#2196F3', '#F44336']
      }]
    };

    const categoriesData = this.getCategoryCounts(reservations);
    this.categoriesChartData = {
      labels: categoriesData.labels,
      datasets: [{
        label: 'Réservations',
        data: categoriesData.data,
        backgroundColor: '#FFC107'
      }]
    };
  }

  prepareMerchantCharts(announcements: any[], reservations: any[]): void {
    const monthsData = this.getMonthlyAnnouncementsData(announcements, 6);
    this.evolutionChartData = {
      labels: monthsData.labels,
      datasets: [{
        label: 'Annonces créées',
        data: monthsData.data,
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    const typeCounts = this.getTypeCounts(announcements);
    this.distributionChartData = {
      labels: typeCounts.labels,
      datasets: [{
        data: typeCounts.data,
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3']
      }]
    };

    const categoriesData = this.getAnnouncementCategoryCounts(announcements);
    this.categoriesChartData = {
      labels: categoriesData.labels,
      datasets: [{
        label: 'Annonces',
        data: categoriesData.data,
        backgroundColor: '#FFC107'
      }]
    };
  }

  getMonthlyData(items: any[], months: number): { labels: string[], data: number[] } {
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      labels.push(monthName);

      const count = items.filter(item => {
        const itemDate = new Date(item.createdAt || item.reservationDate);
        return itemDate.getMonth() === date.getMonth() &&
          itemDate.getFullYear() === date.getFullYear();
      }).length;
      data.push(count);
    }

    return { labels, data };
  }

  getMonthlyAnnouncementsData(announcements: any[], months: number): { labels: string[], data: number[] } {
    return this.getMonthlyData(announcements, months);
  }

  getStatusCounts(reservations: any[]): { labels: string[], data: number[] } {
    const statusMap = new Map<string, number>();

    reservations.forEach(r => {
      const status = r.status || 'UNKNOWN';
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

  getTypeCounts(announcements: any[]): { labels: string[], data: number[] } {
    const typeMap = new Map<string, number>();

    announcements.forEach(a => {
      const type = a.announcementType || 'UNKNOWN';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const labels: string[] = [];
    const data: number[] = [];

    typeMap.forEach((count, type) => {
      labels.push(type);
      data.push(count);
    });

    return { labels, data };
  }

  getCategoryCounts(reservations: any[]): { labels: string[], data: number[] } {
    const categoryMap = new Map<string, number>();

    reservations.forEach(r => {
      const category = r.announcementCategory || r.category || 'Autre';
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

  getAnnouncementCategoryCounts(announcements: any[]): { labels: string[], data: number[] } {
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
      'PENDING_PAYMENT': 'Paiement en attente',
      'CONFIRMED': 'Confirmée',
      'COMPLETED': 'Complétée',
      'CANCELLED': 'Annulée'
    };
    return statusMap[status] || status;
  }

  isExpired(announcement: any): boolean {
    if (!announcement.expiryDate) return false;
    return new Date(announcement.expiryDate) < new Date();
  }
}

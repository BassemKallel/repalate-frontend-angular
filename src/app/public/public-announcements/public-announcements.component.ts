import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AnnouncementService } from '../../services/announcement.service';
import { Announcement } from '../../shared/models/announcement';

interface Category {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-public-announcements',
  templateUrl: './public-announcements.component.html',
  styleUrls: ['./public-announcements.component.scss']
})
export class PublicAnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  paginatedAnnouncements: Announcement[] = [];

  categories: Category[] = [
    { id: 'all', label: 'All', icon: 'fastfood' },
    { id: 'BAKERY', label: 'Bakery', icon: 'cake' },
    { id: 'FRUITS_VEGETABLES', label: 'Fruits & Vegetables', icon: 'spa' },
    { id: 'DAIRY', label: 'Dairy', icon: 'local_cafe' },
    { id: 'PREPARED_MEALS', label: 'Prepared Meals', icon: 'restaurant_menu' },
    { id: 'MEAT_FISH', label: 'Meat & Fish', icon: 'outdoor_grill' },
    { id: 'GROCERY', label: 'Grocery', icon: 'local_grocery_store' },
    { id: 'OTHER', label: 'Other', icon: 'kitchen' }
  ];

  selectedCategory = 'all';
  selectedType = 'all';
  searchTerm = '';
  sortBy = 'recent';
  loading = true;

  pageSize = 12;
  pageIndex = 0;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private announcementService: AnnouncementService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getAll().subscribe({
      next: (announcements) => {
        console.log('API Response:', announcements);
        console.log('Statuses:', announcements.map(a => a.moderationStatus));
        // this.announcements = announcements.filter(a => a.moderationStatus === 'ACCEPTED');
        this.announcements = announcements;
        console.log('Filtered Announcements:', this.announcements);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
      }
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.pageIndex = 0;
    this.applyFilters();
  }

  selectType(type: string): void {
    this.selectedType = type;
    this.pageIndex = 0;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.announcements];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === this.selectedCategory);
    }

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(a => a.announcementType === this.selectedType);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered = this.sortAnnouncements(filtered);

    this.filteredAnnouncements = filtered;
    this.totalItems = filtered.length;
    this.updatePagination();
  }

  sortAnnouncements(announcements: Announcement[]): Announcement[] {
    switch (this.sortBy) {
      case 'expiry':
        return announcements.sort((a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );
      case 'stock':
        return announcements.sort((a, b) => b.stock - a.stock);
      case 'recent':
      default:
        return announcements.sort((a, b) => b.id - a.id);
    }
  }

  updatePagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAnnouncements = this.filteredAnnouncements.slice(startIndex, endIndex);
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.id === category);
    return cat ? cat.label : category;
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.id === category);
    return cat ? cat.icon : 'fastfood';
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'DONATION': 'volunteer_activism',
      'SALE': 'shopping_cart'
    };
    return icons[type] || 'fastfood';
  }

  getImagePlaceholder(category: string): string {
    const colors: { [key: string]: string } = {
      'BAKERY': '#FF9800',
      'FRUITS_VEGETABLES': '#4CAF50',
      'DAIRY': '#2196F3',
      'PREPARED_MEALS': '#9C27B0',
      'MEAT_FISH': '#F44336',
      'GROCERY': '#FFC107',
      'OTHER': '#757575'
    };
    return colors[category] || colors['OTHER'];
  }

  viewDetails(id: number): void {
    this.router.navigate(['/announcement', id]);
  }
}

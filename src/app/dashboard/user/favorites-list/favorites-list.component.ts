import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FavoriteList } from '../../../shared/models/favorite';
import { FavoriteService } from '../../../services/favorite.service';

@Component({
  selector: 'app-favorites-list',
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.scss'
})
export class FavoritesListComponent implements OnInit {
  favorites?: FavoriteList;
  loading = true;

  constructor(
    private favoriteService: FavoriteService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    console.log('Loading favorites...');
    this.favoriteService.getMyFavorites().subscribe({
      next: (favorites) => {
        console.log('Favorites received:', favorites);
        this.favorites = favorites;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.loading = false;
      }
    });
  }

  removeAnnouncement(id: number): void {
    this.favoriteService.removeAnnouncementFavorite(id).subscribe({
      next: () => {
        this.snackBar.open('Announcement removed from favorites', 'Close', { duration: 2000 });
        this.loadFavorites();
      }
    });
  }

  removeMerchant(id: number): void {
    this.favoriteService.removeMerchantFavorite(id).subscribe({
      next: () => {
        this.snackBar.open('Merchant removed from favorites', 'Close', { duration: 2000 });
        this.loadFavorites();
      }
    });
  }

  viewAnnouncement(id: number): void {
    this.router.navigate(['/announcement', id]);
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'BAKERY': 'Bakery',
      'FRUITS_VEGETABLES': 'Fruits & Vegetables',
      'DAIRY': 'Dairy',
      'PREPARED_MEALS': 'Prepared Meals',
      'MEAT_FISH': 'Meat & Fish',
      'GROCERY': 'Grocery',
      'OTHER': 'Other'
    };
    return labels[category] || category;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'BAKERY': 'cake',
      'FRUITS_VEGETABLES': 'spa',
      'DAIRY': 'local_cafe',
      'PREPARED_MEALS': 'restaurant_menu',
      'MEAT_FISH': 'outdoor_grill',
      'GROCERY': 'local_grocery_store',
      'OTHER': 'kitchen'
    };
    return icons[category] || 'fastfood';
  }
}

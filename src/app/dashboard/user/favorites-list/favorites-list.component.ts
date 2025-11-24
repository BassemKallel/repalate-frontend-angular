import { Component, OnInit } from '@angular/core';
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

  constructor(private favoriteService: FavoriteService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.favoriteService.getMyFavorites().subscribe({
      next: (favorites) => {
        this.favorites = { announcements: [], merchants: [] };
        this.loading = false;
      },
      error: () => (this.loading = false)
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
}

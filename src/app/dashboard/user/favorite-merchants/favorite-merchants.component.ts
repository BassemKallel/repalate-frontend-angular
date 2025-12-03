import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../shared/models/user';
import { FavoriteService } from '../../../services/favorite.service';

@Component({
    selector: 'app-favorite-merchants',
    templateUrl: './favorite-merchants.component.html',
    styleUrl: './favorite-merchants.component.scss'
})
export class FavoriteMerchantsComponent implements OnInit {
    merchants: User[] = [];
    loading = true;

    constructor(
        private favoriteService: FavoriteService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadFavorites();
    }

    loadFavorites(): void {
        this.loading = true;
        console.log('Loading favorite merchants...');
        this.favoriteService.getMyFavorites().subscribe({
            next: (favorites) => {
                console.log('Favorite merchants received:', favorites.merchants);
                this.merchants = favorites.merchants || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading favorite merchants:', err);
                this.loading = false;
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

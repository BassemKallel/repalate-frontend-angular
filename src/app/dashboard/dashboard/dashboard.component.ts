import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { User, UserRole } from '../../shared/models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnDestroy {
  currentUser?: User | null;
  sidebarCollapsed = false;
  searchTerm = '';
  private sub: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.sub = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  get role(): UserRole | undefined {
    return this.currentUser?.role;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(value: string): void {
    this.searchTerm = value;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

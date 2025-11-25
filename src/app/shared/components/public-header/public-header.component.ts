import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../shared/models/user';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss'
})
export class PublicHeaderComponent implements OnInit {
  isMenuOpen = false;
  currentUser: User | null = null;

  constructor(
    private viewportScroller: ViewportScroller,
    private router: Router,
    private authService: AuthService
  ) {
    // Listen to navigation events and scroll to fragment
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const tree = this.router.parseUrl(this.router.url);
      if (tree.fragment) {
        setTimeout(() => {
          const element = document.getElementById(tree.fragment!);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('PublicHeader auth update:', user);
    });
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.currentUser = null;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

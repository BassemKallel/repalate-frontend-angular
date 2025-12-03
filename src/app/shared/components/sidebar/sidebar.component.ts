import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../../models/user';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  roles?: UserRole[];
  children?: NavItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() role: UserRole | undefined = 'MERCHANT';
  @Input() collapsed = false;
  @Output() logout = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Stats', icon: 'bar_chart', route: '/dashboard/stats', roles: ['MERCHANT', 'INDIVIDUAL', 'ASSOCIATION'] },
    { label: 'Announcements', icon: 'campaign', route: '/dashboard/announcements', roles: ['MERCHANT'] },
    { label: 'Reservations', icon: 'event_available', route: '/dashboard/reservations', roles: ['MERCHANT', 'INDIVIDUAL', 'ASSOCIATION'] },
    { label: 'Transactions', icon: 'sync_alt', route: '/dashboard/transactions', roles: ['MERCHANT', 'INDIVIDUAL', 'ASSOCIATION'] },
    {
      label: 'Favorites',
      icon: 'favorite',
      roles: ['INDIVIDUAL', 'ASSOCIATION'],
      expanded: false,
      children: [
        { label: 'Announcements', icon: 'campaign', route: '/dashboard/favorites/announcements' },
        { label: 'Merchants', icon: 'store', route: '/dashboard/favorites/merchants' }
      ]
    },
    { label: 'Stats', icon: 'insights', route: '/dashboard/admin/stats', roles: ['ADMIN'] },
    { label: 'Announcements', icon: 'campaign', route: '/dashboard/admin/announcements', roles: ['ADMIN'] },
    { label: 'Transactions', icon: 'sync_alt', route: '/dashboard/admin/transactions', roles: ['ADMIN'] },
    { label: 'Verification', icon: 'verified', route: '/dashboard/admin/verification', roles: ['ADMIN'] },

    { label: 'Users', icon: 'group', route: '/dashboard/admin/users', roles: ['ADMIN'] }
  ];

  constructor(private router: Router) { }

  canDisplay(item: NavItem): boolean {
    if (!item.roles?.length) {
      return true;
    }
    return !!this.role && item.roles.includes(this.role);
  }

  toggleExpand(item: NavItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  navigate(route: string): void {
    this.router.navigateByUrl(route);
  }
}

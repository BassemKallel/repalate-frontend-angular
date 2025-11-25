import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = route.data['roles'] as UserRole[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }
    if (this.authService.hasRole(allowedRoles)) {
      return true;
    }
    return this.router.parseUrl('/dashboard');
  }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { AnnouncementsListComponent } from './dashboard/user/announcements-list/announcements-list.component';
import { CreateAnnouncementComponent } from './dashboard/user/create-announcement/create-announcement.component';
import { AnnouncementDetailsComponent } from './dashboard/user/announcement-details/announcement-details.component';
import { TransactionsListComponent } from './dashboard/user/transactions-list/transactions-list.component';
import { FavoritesListComponent } from './dashboard/user/favorites-list/favorites-list.component';
import { UsersListComponent } from './dashboard/admin/users-list/users-list.component';
import { VerificationComponent } from './dashboard/admin/verification/verification.component';
import { AdminStatsComponent } from './dashboard/admin/stats/admin-stats.component';
import { AdminAnnouncementsComponent } from './dashboard/admin/announcements/admin-announcements.component';
import { AdminTransactionsComponent } from './dashboard/admin/transactions/admin-transactions.component';
import { AdminSignalsComponent } from './dashboard/admin/signals/admin-signals.component';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { ReservationsComponent } from './dashboard/user/reservations/reservations.component';
import { StatsComponent } from './dashboard/user/stats/stats.component';
import { PublicAnnouncementsComponent } from './public/public-announcements/public-announcements.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

import { HomeComponent } from './public/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'browse', component: PublicAnnouncementsComponent },
  { path: 'announcement/:id', component: AnnouncementDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'announcements', pathMatch: 'full' },
      { path: 'announcements', component: AnnouncementsListComponent },
      {
        path: 'announcements/create',
        component: CreateAnnouncementComponent,
        canActivate: [RoleGuard],
        data: { roles: ['MERCHANT'] }
      },
      {
        path: 'announcements/edit/:id',
        component: CreateAnnouncementComponent,
        canActivate: [RoleGuard],
        data: { roles: ['MERCHANT'] }
      },
      { path: 'announcements/:id', component: AnnouncementDetailsComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'transactions', component: TransactionsListComponent },
      {
        path: 'favorites',
        component: FavoritesListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['INDIVIDUAL', 'ASSOCIATION'] }
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'admin/users',
        component: UsersListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/stats',
        component: AdminStatsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/announcements',
        component: AdminAnnouncementsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/transactions',
        component: AdminTransactionsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/verification',
        component: VerificationComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/signals',
        component: AdminSignalsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }


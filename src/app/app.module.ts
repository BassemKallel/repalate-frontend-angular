import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

// Auth
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';

// Dashboard
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { SettingsComponent } from './dashboard/settings/settings.component';

// Admin
import { UsersListComponent } from './dashboard/admin/users-list/users-list.component';
import { UserDetailsDialogComponent } from './dashboard/admin/users-list/user-details-dialog/user-details-dialog.component';
import { VerificationComponent } from './dashboard/admin/verification/verification.component';
import { AdminStatsComponent } from './dashboard/admin/stats/admin-stats.component';
import { AdminAnnouncementsComponent } from './dashboard/admin/announcements/admin-announcements.component';
import { AdminTransactionsComponent } from './dashboard/admin/transactions/admin-transactions.component';
import { AdminSignalsComponent } from './dashboard/admin/signals/admin-signals.component';

// User
import { AnnouncementsListComponent } from './dashboard/user/announcements-list/announcements-list.component';
import { CreateAnnouncementComponent } from './dashboard/user/create-announcement/create-announcement.component';
import { AnnouncementDetailsComponent } from './dashboard/user/announcement-details/announcement-details.component';
import { TransactionsListComponent } from './dashboard/user/transactions-list/transactions-list.component';
import { FavoritesListComponent } from './dashboard/user/favorites-list/favorites-list.component';
import { FavoriteAnnouncementsComponent } from './dashboard/user/favorite-announcements/favorite-announcements.component';
import { FavoriteMerchantsComponent } from './dashboard/user/favorite-merchants/favorite-merchants.component';
import { ReservationsComponent } from './dashboard/user/reservations/reservations.component';
import { StatsComponent } from './dashboard/user/stats/stats.component';

// Public
import { PublicAnnouncementsComponent } from './public/public-announcements/public-announcements.component';
import { HomeComponent } from './public/home/home.component';

import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    UsersListComponent,
    VerificationComponent,
    AnnouncementsListComponent,
    CreateAnnouncementComponent,
    AnnouncementDetailsComponent,
    TransactionsListComponent,
    FavoritesListComponent,
    FavoriteAnnouncementsComponent,
    FavoriteMerchantsComponent,
    SettingsComponent,
    ReservationsComponent,
    StatsComponent,
    AdminStatsComponent,
    AdminAnnouncementsComponent,
    AdminTransactionsComponent,
    AdminSignalsComponent,
    PublicAnnouncementsComponent,
    HomeComponent,
    UserDetailsDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    provideCharts(withDefaultRegisterables())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

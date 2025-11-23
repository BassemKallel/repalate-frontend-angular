import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { MapComponent } from './shared/components/map/map.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { UsersListComponent } from './dashboard/admin/users-list/users-list.component';
import { VerificationComponent } from './dashboard/admin/verification/verification.component';
import { AnnouncementsListComponent } from './dashboard/user/announcements-list/announcements-list.component';
import { CreateAnnouncementComponent } from './dashboard/user/create-announcement/create-announcement.component';
import { AnnouncementDetailsComponent } from './dashboard/user/announcement-details/announcement-details.component';
import { TransactionsListComponent } from './dashboard/user/transactions-list/transactions-list.component';
import { FavoritesListComponent } from './dashboard/user/favorites-list/favorites-list.component';
import { AdminStatsComponent } from './dashboard/admin/stats/admin-stats.component';
import { AdminAnnouncementsComponent } from './dashboard/admin/announcements/admin-announcements.component';
import { AdminTransactionsComponent } from './dashboard/admin/transactions/admin-transactions.component';
import { AdminSignalsComponent } from './dashboard/admin/signals/admin-signals.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { LocationPickerDialogModule } from './shared/components/location-dialog/location-dialog.module';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

// Importing the HomeComponent
import { HomeComponent } from './public/home/home.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    SidebarComponent,
    MapComponent,
    DashboardComponent,
    UsersListComponent,
    VerificationComponent,
    AnnouncementsListComponent,
    CreateAnnouncementComponent,
    AnnouncementDetailsComponent,
    TransactionsListComponent,
    FavoritesListComponent,
    SettingsComponent,
    ConfirmDialogComponent,
    AdminStatsComponent,
    AdminAnnouncementsComponent,
    AdminTransactionsComponent,
    AdminSignalsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,

    NavbarComponent,
    FooterComponent,
    HomeComponent, // Adding HomeComponent to the imports
    LocationPickerDialogModule, 
    HeaderComponent
    
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}


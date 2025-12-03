import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
import { MatTabsModule } from '@angular/material/tabs';

// Components
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PublicHeaderComponent } from './components/public-header/public-header.component';
import { PublicFooterComponent } from './components/public-footer/public-footer.component';
import { PaymentDialogComponent } from './components/payment-dialog/payment-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MapComponent } from './components/map/map.component';

const MATERIAL_MODULES = [
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
    MatTabsModule
];

const SHARED_COMPONENTS = [
    HeaderComponent,
    SidebarComponent,
    PublicHeaderComponent,
    PublicFooterComponent,
    PaymentDialogComponent,
    ConfirmDialogComponent,
    MapComponent
];

@NgModule({
    declarations: [
        ...SHARED_COMPONENTS
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        BaseChartDirective,
        ...MATERIAL_MODULES
    ],
    exports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        BaseChartDirective,
        ...MATERIAL_MODULES,
        ...SHARED_COMPONENTS
    ]
})
export class SharedModule { }

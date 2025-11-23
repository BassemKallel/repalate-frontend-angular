import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsageInFormComponent } from './usage-in-form.component';
import { LocationPickerDialogModule } from '../location-dialog/location-dialog.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [UsageInFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    LocationPickerDialogModule,
    MatButtonModule
  ],
  exports: [UsageInFormComponent]
})
export class UsageInFormModule {}

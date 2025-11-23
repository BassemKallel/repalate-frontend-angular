import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PublicRoutingModule } from './public-routing.module';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from '../shared/components/header/header.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    PublicRoutingModule,
  ],
  exports: [
  ]
})
export class PublicModule { }
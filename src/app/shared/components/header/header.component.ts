import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, debounceTime } from 'rxjs';
import { UserRole } from '../../../shared/models/user';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,MatIconModule,MatButtonModule,MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  @Input() userName = 'John Doe';
  @Input() role: UserRole | undefined = 'MERCHANT';
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchControl = new FormControl('');
  private sub: Subscription;

  constructor() {
    this.sub = this.searchControl.valueChanges.pipe(debounceTime(250)).subscribe((value) => {
      this.search.emit(value ?? '');
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

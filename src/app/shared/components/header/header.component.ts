import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, debounceTime } from 'rxjs';
import { UserRole } from '../../../shared/models/user';

@Component({
  selector: 'app-header',
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

  constructor(private router: Router) {
    this.sub = this.searchControl.valueChanges.pipe(debounceTime(250)).subscribe((value) => {
      this.search.emit(value ?? '');
    });
  }

  navigate(route: string): void {
    this.router.navigateByUrl(route);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

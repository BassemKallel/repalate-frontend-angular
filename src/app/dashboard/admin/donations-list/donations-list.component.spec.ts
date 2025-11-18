import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationsListComponent } from './donations-list.component';

describe('DonationsListComponent', () => {
  let component: DonationsListComponent;
  let fixture: ComponentFixture<DonationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonationsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DonationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the footer component', () => {
    expect(component).toBeTruthy();
  });

  it('should contain the current year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(new Date().getFullYear().toString());
  });

  it('should render company links', () => {
    expect(component.companyLinks.length).toBeGreaterThan(0);
  });

  it('should render support links', () => {
    expect(component.supportLinks.length).toBeGreaterThan(0);
  });

  it('should render involvement links', () => {
    expect(component.involvementLinks.length).toBeGreaterThan(0);
  });
});

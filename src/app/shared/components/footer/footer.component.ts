import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  socialLinks = [
    { icon: 'fab fa-linkedin-in', url: '#' },
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-facebook-f', url: '#' }
  ];

  companyLinks = ['About Us', 'Our Mission', 'Partners', 'Careers', 'Contact'];
  supportLinks = ['FAQ', 'Resources', 'Services', 'Help Center', 'Accessibility'];
  involvementLinks = ['Donate Food', 'Volunteer', 'Partner with Us', 'Fundraise', 'Beneficiary'];
}

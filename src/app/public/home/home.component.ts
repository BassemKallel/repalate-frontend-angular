import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [NavbarComponent,FooterComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // FAQ items
  faqItems = [
    {
      question: 'What is Replate?',
      answer: 'Replate is a platform that connects food donors with local communities to reduce food waste and fight hunger.'
    },
    {
      question: 'How to donate food?',
      answer: 'Simply sign up as a donor, list your available food items, and connect with local organizations in need.'
    },
    {
      question: 'What kind of service will you get?',
      answer: 'We provide a seamless platform for food donation, tracking, and impact measurement to make your contributions count.'
    }
  ];

  // Steps data
  steps = [
    {
      number: '1',
      title: 'Download the App',
      description: 'Get started by downloading our mobile app from the App Store or Google Play.'
    },
    {
      number: '2',
      title: 'Sign Up',
      description: 'Create an account as a donor, volunteer, or recipient organization.'
    },
    {
      number: '3',
      title: 'Post or Claim Food',
      description: 'Donors can post available food, and recipients can claim what they need.'
    },
    {
      number: '4',
      title: 'Collect & Share Impact',
      description: 'Track your contributions and see the positive impact you\'re making in your community.'
    }
  ];

  // Stats data
  stats = [
    { number: '15M+', label: 'Meals Served' },
    { number: '1200', label: 'Volunteers' },
    { number: '25+', label: 'Cities Covered' },
    { number: '85%', label: 'Less Waste' }
  ];

  // CTA cards
  ctaCards = [
    {
      icon: '🍽️',
      title: 'Donate',
      description: 'Share your surplus food with those in need.'
    },
    {
      icon: '🤝',
      title: 'Volunteer',
      description: 'Join our community of volunteers making a difference.'
    },
    {
      icon: '🏢',
      title: 'Partner',
      description: 'Businesses can partner with us to reduce food waste.'
    }
  ];
}

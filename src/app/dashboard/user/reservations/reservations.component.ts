import { Component } from '@angular/core';

interface Reservation {
  id: number;
  announcement: string;
  customer: string;
  quantity: string;
  pickupDate: string;
  status: string;
}

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent {
  displayedColumns: string[] = ['id', 'announcement', 'customer', 'quantity', 'pickupDate', 'status', 'actions'];

  reservations: Reservation[] = [
    {
      id: 1,
      announcement: 'Fresh Baguettes',
      customer: 'Ahmed Ben Salem',
      quantity: '5 kg',
      pickupDate: '2025-11-24 10:00',
      status: 'Pending'
    },
    {
      id: 2,
      announcement: 'Organic Vegetables',
      customer: 'Nour Association',
      quantity: '10 kg',
      pickupDate: '2025-11-24 14:00',
      status: 'Confirmed'
    },
    {
      id: 3,
      announcement: 'Dairy Products',
      customer: 'Mohamed Ali',
      quantity: '3 L',
      pickupDate: '2025-11-23 16:00',
      status: 'Completed'
    },
    {
      id: 4,
      announcement: 'Prepared Meals',
      customer: 'Fatma Trabelsi',
      quantity: '8 pieces',
      pickupDate: '2025-11-25 12:00',
      status: 'Pending'
    },
    {
      id: 5,
      announcement: 'Fresh Fruits',
      customer: 'Karim Essid',
      quantity: '7 kg',
      pickupDate: '2025-11-22 09:00',
      status: 'Cancelled'
    }
  ];
}

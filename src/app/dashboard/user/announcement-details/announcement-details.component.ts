import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Announcement } from '../../../shared/models/announcement';
import { AnnouncementService } from '../../../services/announcement.service';

interface RelatedOffer {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcement-details.component.html',
  styleUrl: './announcement-details.component.scss'
})
export class AnnouncementDetailsComponent implements OnInit {
  announcement?: Announcement;
  loading = true;
  relatedOffers: RelatedOffer[] = [
    {
      id: '1',
      name: 'Ahmed Ben Salem',
      avatar: 'https://i.pravatar.cc/120?img=5',
      role: 'Individual'
    },
    {
      id: '2',
      name: 'Nour Association',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Association'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAnnouncement(id);
    }
  }

  loadAnnouncement(id: string): void {
    this.loading = true;
    this.announcementService.getById(id).subscribe({
      next: (announcement) => {
        this.announcement = announcement;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Announcement not found', 'Close', { duration: 3000 });
      }
    });
  }

  edit(): void {
    if (this.announcement) {
      this.router.navigate(['/dashboard/announcements/create'], {
        queryParams: { edit: this.announcement.id }
      });
    }
  }

  delete(): void {
    if (!this.announcement || !confirm('Delete this announcement?')) {
      return;
    }
    this.announcementService.delete(this.announcement.id).subscribe({
      next: () => {
        this.snackBar.open('Announcement deleted', 'Close', { duration: 2500 });
        this.router.navigate(['/dashboard/announcements']);
      },
      error: () => this.snackBar.open('Unable to delete announcement', 'Close', { duration: 3000 })
    });
  }

  openOffer(offer: RelatedOffer, action: 'accept' | 'decline'): void {
    this.snackBar.open(`${offer.name} ${action === 'accept' ? 'accepted' : 'declined'}`, 'Close', {
      duration: 2000
    });
  }
}

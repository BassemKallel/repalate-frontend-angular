export type AnnouncementType = 'SALE' | 'DONATION';
export type ModerationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'DELETED';

export interface Announcement {
  id: number;
  merchantId: number;
  title: string;
  description: string;
  announcementType: AnnouncementType;
  moderationStatus: ModerationStatus;
  category: string;
  unit: string;
  stock: number;
  price: number;
  imageUrl1?: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean; // UI-only property
}



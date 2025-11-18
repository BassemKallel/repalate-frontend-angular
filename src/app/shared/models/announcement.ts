export type AnnouncementType = 'FREE' | 'PAID';

export interface Announcement {
  id: number;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  pickupAddress: string;
  imageUrl?: string;
  contactNumber: string;
  type: AnnouncementType;
  status?: 'Pending' | 'Approved' | 'Deleted' | 'Completed';
  pricePerUnit?: number;
  createdAt?: string;
  merchantName?: string;
}


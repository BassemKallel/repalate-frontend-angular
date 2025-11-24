import { Announcement } from './announcement';
import { User } from './user';

export type TargetType = 'ANNOUNCEMENT' | 'MERCHANT';

export interface Favorite {
  id: number;
  userId: number;
  targetId: number;
  targetType: TargetType;
  createdAt: string;
}

export interface FavoriteList {
  announcements: Announcement[];
  merchants: User[];
}


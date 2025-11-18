export type UserRole = 'INDIVIDUAL' | 'MERCHANT' | 'ASSOCIATION' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  organizationName?: string;
  email: string;
  phoneNumber: string;
  location: string;
  role: UserRole;
  isValidated?: boolean;
  status?: 'Active' | 'Inactive';
  joinDate?: string;
  profileImageUrl?: string;
  documentUrl?: string;
}


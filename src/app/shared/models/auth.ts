export type UserRole = 'INDIVIDUAL' | 'MERCHANT' | 'ASSOCIATION' | 'ADMIN';

export interface RegisterRequest {
  email: string;
  password: string;
  username: string; // Au lieu de fullName/organizationName
  phoneNumber: string;
  location: string;
  role: UserRole;
  documentUrl?: string; // Au lieu de verificationDocumentUrl
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  jwtToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  organizationName?: string;
  phoneNumber?: string;
  location?: string;
}

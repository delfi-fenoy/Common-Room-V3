export interface User {
  id?: number;
  username: string;
  email?: string;
  profilePictureUrl?: string;
  description?: string;
  role?: Role;
  createdAt?: string;
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

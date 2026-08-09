export interface User {
    id?: number;
    username: string;
    email?: string;
    description?: string;
    role?: Role;
    createdAt?: string;
    profilePictureUrl?: string;
    isBanned?: boolean;
}

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

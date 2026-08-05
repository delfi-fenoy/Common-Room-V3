export interface User {
    id?: number;
    username: string;
    email?: string;
    profilePictureUrl?: string;
    description?: string;
    role?: Role;
    createdAt?: string;
    isBanned?: boolean;
}

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

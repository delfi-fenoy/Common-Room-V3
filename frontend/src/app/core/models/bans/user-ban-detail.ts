export interface UserBanDetails {
    id: number;
    bannedUsername: string;
    bannedByUsername: string;
    bannedAt: string;
    reason: string;
    unbannedAt?: string;
    unbannedByUsername?: string;
}
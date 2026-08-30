export interface UserBanResponse {
    id: number;
    bannedUsername: string;
    bannedByUsername: string;
    bannedAt: string;
    reason: string;
    unbannedAt?: string;
    unbannedByUsername?: string;
}
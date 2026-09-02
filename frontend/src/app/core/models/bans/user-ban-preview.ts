export interface UserBanPreview {
    id: number;
    bannedByUsername: string;
    bannedAt: string;
    reason: string;
    unbannedAt?: string;
    unbannedByUsername?: string;
}
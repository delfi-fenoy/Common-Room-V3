export interface UserBanResponseDTO {
    id: number;
    bannedUsername: string;
    bannedByUsername: string;
    bannedAt: string;
    reason: string;
    unbannedAt?: string;
    unbannedByUsername?: string;
}
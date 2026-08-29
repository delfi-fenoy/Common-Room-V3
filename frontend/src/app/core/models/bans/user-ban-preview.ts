export interface UserBanPreviewDTO {
    id: number;
    bannedAt: string;
    reason: string;
    isUnbanned: boolean;
}
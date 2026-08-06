import { UserPreview } from '../users/user-preview';

// Modelo simplificado retornado en listados y búsquedas (sin descripción)
export interface PlaylistPreview {
    id: number;
    name: string;
    isPrivate: boolean;
    pictureUrl?: string;
    userPreviewDTO?: UserPreview;
}
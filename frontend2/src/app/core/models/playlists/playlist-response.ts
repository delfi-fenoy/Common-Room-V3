import { UserPreview } from '../users/user-preview';

export interface PlaylistResponse {
    id: number;
    name: string;
    description: string;
    isPrivate: boolean;
    pictureUrl: string;
    user?: UserPreview;
}
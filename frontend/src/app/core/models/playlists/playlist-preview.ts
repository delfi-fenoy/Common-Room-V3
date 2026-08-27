import { UserPreview } from "../users/user-preview";

export interface PlaylistPreview {
    id: number;
    name: string;
    isPrivate: boolean;
    pictureUrl?: string;
    userPreview: UserPreview;
}
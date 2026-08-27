import { PlaylistPreview } from './playlist-preview';
import { MoviePreview } from '../movies/movie-preview';

export interface PlaylistDetails extends PlaylistPreview {
    description?: string;
    createdAt: string;
    movies?: MoviePreview[];
}
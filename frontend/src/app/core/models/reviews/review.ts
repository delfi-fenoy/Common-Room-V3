import { MoviePreview } from '../movies/movie-preview';
import { UserPreview } from '../users/user-preview';

export interface Review {
    id: number;
    movieId?: number;
    rating: number;
    comment?: string;
    createdAt: string;
    moviePreview?: MoviePreview;
    userPreview?: UserPreview;
}

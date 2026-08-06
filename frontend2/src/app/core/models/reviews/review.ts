import { MovieBase } from '../movies/movie-base';
import { UserPreview } from '../users/user-preview';

export interface Review {
    id: number;
    movieId?: number;
    rating: number;
    comment?: string;
    createdAt: string;
    moviePreview?: MovieBase; 
    userPreview?: UserPreview;          
}
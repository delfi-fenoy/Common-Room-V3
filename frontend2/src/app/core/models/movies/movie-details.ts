import { MoviePreview } from './movie-preview';

export interface MovieDetails extends MoviePreview {
    duration?: number;
    genres?: string[];
    voteAverage?: number;
    budget?: number;
    revenue?: number;
    backdropUrl?: string;
}

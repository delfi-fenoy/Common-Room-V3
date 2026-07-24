import { MovieBase }  from "./movie-base";

export interface MovieDetails extends MovieBase {
    duration?: number;
    genres?: string[];
    voteAverage?: number;
    budget?: number;
    revenue?: number;
    backdropUrl?: string;
}
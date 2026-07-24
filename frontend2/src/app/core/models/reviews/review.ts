import { MovieDetails } from "../movies/movie-details";
import { User } from "../users/User";

export interface Review {
    id: number;
    rating: number;
    comment?: string;
    createdAt: string;
    moviePreview: MovieDetails;
    userPreview: User;
}

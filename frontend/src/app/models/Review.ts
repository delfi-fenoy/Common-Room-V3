import { MovieDetails } from "./MovieDetails";
import { User } from "./User";

export interface Review {
    id: number;
    rating: number;
    comment?: string;
    createdAt: string;
    moviePreview: MovieDetails;
    userPreview: User;
}

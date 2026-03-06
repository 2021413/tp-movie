import type { Movie } from "./Movie.js";

export interface IMovieRepository {
  list(): Promise<Movie[]>;
  findById(id: number): Promise<Movie | null>;
}

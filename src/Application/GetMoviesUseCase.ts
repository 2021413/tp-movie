import type { IMovieRepository } from "../Domain/IMovieRepository.js";
import type { Movie } from "../Domain/Movie.js";

export class GetMoviesUseCase {
  constructor(private readonly movies: IMovieRepository) {}

  execute(): Promise<Movie[]> {
    return this.movies.list();
  }
}

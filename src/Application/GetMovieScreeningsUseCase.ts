import type { IMovieRepository } from "../Domain/IMovieRepository.js";
import type { IScreeningRepository } from "../Domain/IScreeningRepository.js";
import type { Screening } from "../Domain/Screening.js";

export class GetMovieScreeningsUseCase {
  constructor(
    private readonly movies: IMovieRepository,
    private readonly screenings: IScreeningRepository,
  ) {}

  async execute(movieId: number): Promise<Screening[] | null> {
    const movie = await this.movies.findById(movieId);
    if (!movie) return null;
    return this.screenings.listByMovieId(movieId);
  }
}

import type { Screening } from "./Screening.js";

export interface IScreeningRepository {
  listByMovieId(movieId: number): Promise<Screening[]>;
}

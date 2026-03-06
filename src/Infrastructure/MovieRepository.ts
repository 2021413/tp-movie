import type { Pool } from "pg";
import type { Movie } from "../Domain/Movie.js";
import type { IMovieRepository } from "../Domain/IMovieRepository.js";

export class MovieRepository implements IMovieRepository {
  constructor(private readonly pool: Pool) {}

  async list(): Promise<Movie[]> {
    const result = await this.pool.query<Movie>(`
      SELECT
        id,
        title,
        description,
        duration_minutes AS "durationMinutes",
        rating,
        release_date::text AS "releaseDate"
      FROM movies
      ORDER BY id ASC
    `);
    return result.rows;
  }

  async findById(id: number): Promise<Movie | null> {
    const result = await this.pool.query<Movie>(
      `
      SELECT
        id,
        title,
        description,
        duration_minutes AS "durationMinutes",
        rating,
        release_date::text AS "releaseDate"
      FROM movies
      WHERE id = $1
      `,
      [id]
    );
    return result.rows[0] ?? null;
  }
}
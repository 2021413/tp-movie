import type { Pool } from "pg";
import type { Screening } from "../Domain/Screening.js";
import type { IScreeningRepository } from "../Domain/IScreeningRepository.js";

type ScreeningRow = {
  id: number;
  movieId: number;
  startTime: string;
  price: number;
  roomId: number;
  roomName: string;
  roomCapacity: number;
};

export class ScreeningRepository implements IScreeningRepository {
  constructor(private readonly pool: Pool) {}

  async listByMovieId(movieId: number): Promise<Screening[]> {
    const result = await this.pool.query<ScreeningRow>(
      `
      SELECT
        s.id,
        s.movie_id        AS "movieId",
        s.start_time::text AS "startTime",
        s.price::float8   AS "price",
        r.id              AS "roomId",
        r.name            AS "roomName",
        r.capacity        AS "roomCapacity"
      FROM screenings s
      JOIN rooms r ON r.id = s.room_id
      WHERE s.movie_id = $1
      ORDER BY s.start_time ASC
      `,
      [movieId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      movieId: row.movieId,
      startTime: row.startTime,
      price: row.price,
      room: {
        id: row.roomId,
        name: row.roomName,
        capacity: row.roomCapacity,
      },
    }));
  }
}

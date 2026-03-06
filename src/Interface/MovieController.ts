import type { IncomingMessage, ServerResponse } from "node:http";
import type { GetMoviesUseCase } from "../Application/GetMoviesUseCase.js";
import { sendJson } from "./helpers.js";

export class MovieController {
  constructor(private readonly getMovies: GetMoviesUseCase) {}

  async list(_req: IncomingMessage, res: ServerResponse): Promise<void> {
    const items = await this.getMovies.execute();
    sendJson(res, 200, { ok: true, items });
  }
}

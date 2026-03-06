import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import type { GetMovieScreeningsUseCase } from "../Application/GetMovieScreeningsUseCase.js";
import { sendJson, sendError } from "./helpers.js";

const MovieIdSchema = z.coerce.number().int().positive();

export class ScreeningController {
  constructor(private readonly getMovieScreenings: GetMovieScreeningsUseCase) {}

  async listByMovieId(
    _req: IncomingMessage,
    res: ServerResponse,
    rawId: string,
  ): Promise<void> {
    const parsed = MovieIdSchema.safeParse(rawId);
    if (!parsed.success) return sendError(res, 400, "Invalid movie id");

    const items = await this.getMovieScreenings.execute(parsed.data);
    if (items === null) return sendError(res, 404, "Movie not found");

    sendJson(res, 200, { ok: true, items });
  }
}

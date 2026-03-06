import type { IncomingMessage, ServerResponse } from "node:http";
import type { MovieController } from "./Interface/MovieController.js";
import type { ScreeningController } from "./Interface/ScreeningController.js";
import { sendJson, sendError } from "./Interface/helpers.js";

type RouterDeps = {
  movieController: MovieController;
  screeningController: ScreeningController;
};

export async function router(
  req: IncomingMessage,
  res: ServerResponse,
  deps: RouterDeps
): Promise<void> {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname;
  const segments = path.split("/").filter(Boolean);

  try {
    // GET /health
    if (method === "GET" && path === "/health") {
      return sendJson(res, 200, { ok: true });
    }

    // GET /movies
    if (method === "GET" && path === "/movies") {
      return deps.movieController.list(req, res);
    }

    // GET /movies/:id/screenings  (alias: /seances)
    if (
      method === "GET" &&
      segments.length === 3 &&
      segments[0] === "movies" &&
      (segments[2] === "screenings" || segments[2] === "seances")
    ) {
      return deps.screeningController.listByMovieId(req, res, segments[1]);
    }

    return sendError(res, 404, "Route not found");
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Internal server error");
  }
}

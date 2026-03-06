import "dotenv/config";
import { createServer } from "node:http";

import { pool } from "./Infrastructure/DB.js";
import { MovieRepository } from "./Infrastructure/MovieRepository.js";
import { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";

import { GetMoviesUseCase } from "./Application/GetMoviesUseCase.js";
import { GetMovieScreeningsUseCase } from "./Application/GetMovieScreeningsUseCase.js";

import { MovieController } from "./Interface/MovieController.js";
import { ScreeningController } from "./Interface/ScreeningController.js";

import { router } from "./router.js";

const PORT = Number(process.env.PORT ?? 3001);

// Infrastructure
const movieRepo = new MovieRepository(pool);
const screeningRepo = new ScreeningRepository(pool);

// Use cases
const getMovies = new GetMoviesUseCase(movieRepo);
const getMovieScreenings = new GetMovieScreeningsUseCase(movieRepo, screeningRepo);

// Controllers
const movieController = new MovieController(getMovies);
const screeningController = new ScreeningController(getMovieScreenings);

const server = createServer(async (req, res) => {
  await router(req, res, { movieController, screeningController });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

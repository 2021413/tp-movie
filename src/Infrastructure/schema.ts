import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/pg-core";

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(),
  rating: varchar("rating", { length: 10 }),
  releaseDate: date("release_date"),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  capacity: integer("capacity").notNull(),
});

export const screenings = pgTable("screenings", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id")
    .notNull()
    .references(() => movies.id),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  price: numeric("price", { precision: 6, scale: 2 }).notNull(),
});

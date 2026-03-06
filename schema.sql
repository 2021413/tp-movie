-- Schema TP Movie

DROP TABLE IF EXISTS screenings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS movies;

CREATE TABLE movies (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255)  NOT NULL,
  description      TEXT,
  duration_minutes INTEGER       NOT NULL,
  rating           VARCHAR(10),
  release_date     DATE
);

CREATE TABLE rooms (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  capacity INTEGER      NOT NULL
);

CREATE TABLE screenings (
  id         SERIAL PRIMARY KEY,
  movie_id   INTEGER        NOT NULL REFERENCES movies(id),
  room_id    INTEGER        NOT NULL REFERENCES rooms(id),
  start_time TIMESTAMPTZ    NOT NULL,
  price      NUMERIC(6, 2)  NOT NULL
);

-- Donnees de test

INSERT INTO movies (title, description, duration_minutes, rating, release_date) VALUES
  ('Inception',       'Un voleur qui entre dans les reves.',           148, 'PG-13', '2010-07-16'),
  ('Interstellar',    'Des astronautes traversent un trou de ver.',    169, 'PG-13', '2014-11-05'),
  ('The Dark Knight', 'Batman affronte le Joker a Gotham.',           152, 'PG-13', '2008-07-18'),
  ('Dune',            'La planete Arrakis et l epice.',               155, 'PG-13', '2021-10-22'),
  ('The Matrix',      'Un programmeur decouvre la realite simulee.',  136, 'R',     '1999-03-31');

INSERT INTO rooms (name, capacity) VALUES
  ('Salle 1', 120),
  ('Salle 2',  80),
  ('Salle 3', 200);

INSERT INTO screenings (movie_id, room_id, start_time, price) VALUES
  (1, 1, '2025-06-01 14:00:00+02', 9.50),
  (1, 2, '2025-06-01 20:00:00+02', 11.00),
  (2, 1, '2025-06-02 16:00:00+02', 9.50),
  (2, 3, '2025-06-03 20:30:00+02', 12.00),
  (3, 2, '2025-06-01 18:00:00+02', 9.50),
  (4, 1, '2025-06-04 15:00:00+02', 10.00),
  (4, 3, '2025-06-04 20:00:00+02', 12.00),
  (5, 2, '2025-06-05 17:30:00+02', 8.50);
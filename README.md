# TP Movie - Documentation

## Sommaire

1. [Prerequis](#prerequis)
2. [Structure du projet](#structure-du-projet)
3. [Architecture](#architecture)
4. [Demarrage rapide](#demarrage-rapide)
5. [Commandes Makefile](#commandes-makefile)
6. [Variables d'environnement](#variables-denvironnement)
7. [Base de donnees](#base-de-donnees)
8. [Drizzle ORM](#drizzle-orm)
9. [API HTTP](#api-http)

---

## Prerequis

- Node.js 20+
- npm
- Docker et Docker Compose
- make

---

## Structure du projet

```
tp-movie/
├── src/
│   ├── Application/
│   │   ├── GetMoviesUseCase.ts
│   │   └── GetMovieScreeningsUseCase.ts
│   ├── Domain/
│   │   ├── Movie.ts
│   │   ├── Screening.ts
│   │   ├── IMovieRepository.ts
│   │   └── IScreeningRepository.ts
│   ├── Infrastructure/
│   │   ├── DB.ts              # Pool de connexion pg
│   │   ├── drizzle.ts         # Instance Drizzle ORM
│   │   ├── schema.ts          # Schema Drizzle (definition des tables)
│   │   ├── MovieRepository.ts
│   │   └── ScreeningRepository.ts
│   ├── Interface/
│   │   ├── MovieController.ts
│   │   ├── ScreeningController.ts
│   │   └── helpers.ts
│   ├── router.ts
│   └── server.ts
├── drizzle/                   # Fichiers de migration generes
├── schema.sql                 # Schema SQL initial + donnees de test
├── drizzle.config.ts          # Configuration drizzle-kit
├── docker-compose.yml
├── Makefile
├── .env
├── package.json
└── tsconfig.json
```

---

## Architecture

Le projet suit une architecture en couches inspiree de la Clean Architecture.

```
Interface (HTTP)
    └── Application (Use Cases)
            └── Domain (Entites + Interfaces)
                    └── Infrastructure (BDD, Repositories)
```

- **Domain** : types metier (`Movie`, `Screening`) et interfaces des repositories. Aucune dependance externe.
- **Application** : orchestration des use cases. Ne connait que le Domain.
- **Infrastructure** : implementation concrète des repositories avec `pg` et Drizzle ORM.
- **Interface** : controllers HTTP, parsing des requêtes, envoi des reponses JSON.

---

## Demarrage rapide

### Premiere installation

```bash
make setup
```

Cette commande effectue dans l'ordre :
1. Demarre le container PostgreSQL Docker
2. Attend que la base de donnees soit prête
3. Applique `schema.sql` (creation des tables + donnees de test)
4. Installe les dependances npm

### Lancer le serveur en developpement

```bash
make dev
```

Le serveur demarre sur `http://localhost:3001` avec rechargement automatique.

---

## Commandes Makefile

### Application

| Commande      | Description                                    |
|---------------|------------------------------------------------|
| `make install` | Installe les dependances npm                  |
| `make dev`     | Demarre le serveur en mode watch (tsx)        |
| `make build`   | Compile TypeScript vers `dist/`               |
| `make start`   | Lance le serveur compile                      |

### Docker

| Commande       | Description                                   |
|----------------|-----------------------------------------------|
| `make up`      | Demarre les containers en arriere-plan        |
| `make down`    | Arrete les containers                         |
| `make restart` | Redemarre les containers                      |
| `make logs`    | Affiche les logs PostgreSQL en temps reel     |
| `make ps`      | Liste les containers en cours d'execution     |

### Base de donnees

| Commande           | Description                                              |
|--------------------|----------------------------------------------------------|
| `make db-seed`     | Applique `schema.sql` : DROP + CREATE + donnees de test  |
| `make db-reset`    | Identique a `db-seed`, alias pour la clarte              |
| `make db-push`     | Synchronise `schema.ts` avec la base (sans migration)    |
| `make db-generate` | Genere les fichiers de migration dans `drizzle/`         |
| `make db-migrate`  | Applique les migrations en attente                       |
| `make db-studio`   | Ouvre Drizzle Studio dans le navigateur                  |

### Combinee

| Commande     | Description                                                   |
|--------------|---------------------------------------------------------------|
| `make setup` | Installation complete : `up` + `db-seed` + `install`          |
| `make clean` | Supprime containers, volumes Docker, `dist/` et `node_modules/` |

---

## Variables d'environnement

Le fichier `.env` a la racine du projet contient les variables suivantes :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=db
PORT=3001
```

Ces variables sont lues au demarrage par `dotenv` dans `src/Infrastructure/DB.ts` et validees avec `zod`.

---

## Base de donnees

### Schema (`schema.sql`)

Le fichier `schema.sql` definit les trois tables du projet et insere des donnees de test.

```
movies
├── id               SERIAL PRIMARY KEY
├── title            VARCHAR(255) NOT NULL
├── description      TEXT
├── duration_minutes INTEGER NOT NULL
├── rating           VARCHAR(10)
└── release_date     DATE

rooms
├── id               SERIAL PRIMARY KEY
├── name             VARCHAR(100) NOT NULL
└── capacity         INTEGER NOT NULL

screenings
├── id               SERIAL PRIMARY KEY
├── movie_id         INTEGER NOT NULL -> movies(id)
├── room_id          INTEGER NOT NULL -> rooms(id)
├── start_time       TIMESTAMPTZ NOT NULL
└── price            NUMERIC(6,2) NOT NULL
```

### Appliquer le schema

```bash
make db-seed
```

Cette commande execute `schema.sql` directement dans le container Docker via `psql`. Elle drop les tables existantes avant de les recreer, ce qui remet egalement les donnees de test a zero.

---

## Drizzle ORM

### Fichiers cles

| Fichier                            | Role                                          |
|------------------------------------|-----------------------------------------------|
| `src/Infrastructure/schema.ts`     | Definition des tables en TypeScript           |
| `src/Infrastructure/drizzle.ts`    | Instance `db` a importer dans les repositories|
| `drizzle.config.ts`                | Configuration de drizzle-kit (CLI)            |
| `drizzle/`                         | Fichiers de migration SQL generes             |

### Utilisation dans un repository

Importer `db` et les tables depuis `schema.ts` :

```typescript
import { db } from "./drizzle.js";
import { movies, screenings, rooms } from "./schema.js";
import { eq } from "drizzle-orm";
```

#### Selectionner tous les films

```typescript
const allMovies = await db.select().from(movies).orderBy(movies.id);
```

#### Selectionner un film par ID

```typescript
const [movie] = await db
  .select()
  .from(movies)
  .where(eq(movies.id, 1));
```

#### Selectionner les seances d'un film avec JOIN

```typescript
const result = await db
  .select({
    id: screenings.id,
    movieId: screenings.movieId,
    startTime: screenings.startTime,
    price: screenings.price,
    roomName: rooms.name,
    roomCapacity: rooms.capacity,
  })
  .from(screenings)
  .innerJoin(rooms, eq(screenings.roomId, rooms.id))
  .where(eq(screenings.movieId, 1))
  .orderBy(screenings.startTime);
```

#### Inserer un film

```typescript
const [newMovie] = await db
  .insert(movies)
  .values({
    title: "Oppenheimer",
    durationMinutes: 180,
    rating: "R",
    releaseDate: "2023-07-21",
  })
  .returning();
```

#### Mettre a jour un film

```typescript
await db
  .update(movies)
  .set({ rating: "PG-13" })
  .where(eq(movies.id, 1));
```

#### Supprimer un film

```typescript
await db.delete(movies).where(eq(movies.id, 1));
```

### Workflow migrations (alternatif a schema.sql)

Ce workflow remplace `make db-seed` pour les environnements ou les migrations sont gereesa par Drizzle.

```bash
# 1. Modifier src/Infrastructure/schema.ts
# 2. Generer le fichier de migration
make db-generate

# 3. Appliquer la migration sur une DB vierge
make db-migrate
```

> **Attention** : `db-migrate` echoue si les tables existent deja (car la migration
> contient des `CREATE TABLE` sans `IF NOT EXISTS`). Sur une DB deja initialisee
> via `schema.sql`, utiliser `db-push` a la place ou supprimer les tables avant
> d'appliquer la migration.

### Drizzle Studio

```bash
make db-studio
```

Ouvre une interface web pour parcourir et modifier les donnees de la base directement depuis le navigateur.

---

## API HTTP

Le serveur ecoute sur le port defini dans `PORT` (defaut : `3001`).

### GET /health

Verifie que le serveur est en ligne.

**Reponse**
```json
{ "ok": true }
```

---

### GET /movies

Retourne la liste de tous les films.

**Reponse**
```json
{
  "ok": true,
  "items": [
    {
      "id": 1,
      "title": "Inception",
      "description": "Un voleur qui entre dans les reves.",
      "durationMinutes": 148,
      "rating": "PG-13",
      "releaseDate": "2010-07-16"
    }
  ]
}
```

---

### GET /movies/:id/screenings

Retourne les seances d'un film. Accepte aussi l'alias `/movies/:id/seances`.

**Parametres**

| Parametre | Type    | Description              |
|-----------|---------|--------------------------|
| `id`      | integer | Identifiant du film      |

**Reponse**
```json
{
  "ok": true,
  "items": [
    {
      "id": 1,
      "movieId": 1,
      "startTime": "2025-06-01 12:00:00+00",
      "price": 9.5,
      "room": {
        "id": 1,
        "name": "Salle 1",
        "capacity": 120
      }
    }
  ]
}
```

**Erreurs**

| Code | Cas                             |
|------|---------------------------------|
| 400  | L'identifiant n'est pas valide  |
| 404  | Le film n'existe pas            |
| 500  | Erreur interne du serveur       |

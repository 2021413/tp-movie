.PHONY: install dev build start \
        up down restart logs ps \
        db-wait db-seed db-reset db-push db-generate db-migrate db-studio \
        setup clean help

# ── Variables ─────────────────────────────────────────────────────────────────

COMPOSE   := docker compose
CONTAINER := db-postgres-movie
DB_USER   := postgres
DB_NAME   := db

# ── Application ───────────────────────────────────────────────────────────────

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

# ── Docker ────────────────────────────────────────────────────────────────────

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f postgres

ps:
	$(COMPOSE) ps

# ── Database ──────────────────────────────────────────────────────────────────

db-wait:
	@echo "Waiting for PostgreSQL..."
	@until docker exec $(CONTAINER) pg_isready -U $(DB_USER) -d $(DB_NAME) > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "PostgreSQL is ready."

db-seed: db-wait
	@echo "Applying schema.sql (tables + seed data)..."
	@docker exec -i $(CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) < schema.sql
	@echo "Done."

db-reset: db-wait
	@echo "Resetting database from schema.sql..."
	@docker exec -i $(CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) < schema.sql
	@echo "Done."

db-push: db-wait
	npm run db:push

db-generate:
	npm run db:generate

db-migrate: db-wait
	npm run db:migrate

db-studio: db-wait
	npm run db:studio

# ── Combined ──────────────────────────────────────────────────────────────────

setup: up db-seed install
	@echo "Setup complete. Run 'make dev' to start the server."

clean:
	$(COMPOSE) down -v
	rm -rf dist node_modules

# ── Help ──────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Application"
	@echo "  install        Install npm dependencies"
	@echo "  dev            Start the server in watch mode (tsx)"
	@echo "  build          Compile TypeScript to dist/"
	@echo "  start          Run the compiled server"
	@echo ""
	@echo "Docker"
	@echo "  up             Start Docker containers in background"
	@echo "  down           Stop Docker containers"
	@echo "  restart        Restart Docker containers"
	@echo "  logs           Stream PostgreSQL logs"
	@echo "  ps             List running containers"
	@echo ""
	@echo "Database"
	@echo "  db-seed        Apply schema.sql (DROP + CREATE + seed data)"
	@echo "  db-reset       Same as db-seed, alias for clarity"
	@echo "  db-push        Sync Drizzle schema.ts to the database"
	@echo "  db-generate    Generate Drizzle migration files into drizzle/"
	@echo "  db-migrate     Apply pending Drizzle migration files"
	@echo "  db-studio      Open Drizzle Studio in the browser"
	@echo ""
	@echo "Combined"
	@echo "  setup          First-time setup: up + seed + install"
	@echo "  clean          Remove containers, volumes, dist/ and node_modules/"
	@echo ""

# ──────────────────────────────────────────────────────────────
# oauth_containers — development lifecycle
# Single entry point for running, testing, and managing the stack.
# ──────────────────────────────────────────────────────────────

COMPOSE_DEV = docker compose -f docker-compose.dev.yml --env-file .env
COMPOSE_FULL = docker compose -f docker-compose.yml --env-file .env
MONGO_URI = mongodb://localhost:27017

# ── Development ──────────────────────────────────────────────

.PHONY: dev
dev: infra ## Start infra + API + web (Ctrl-C stops everything gracefully)
	@trap 'kill 0; $(MAKE) stop' EXIT INT TERM; \
	cd apps/api && npm run dev & \
	cd apps/web && npm run dev & \
	wait

.PHONY: infra
infra: ## Start MongoDB + Redis containers
	$(COMPOSE_DEV) up -d --build

.PHONY: backend
backend: infra ## Start infra + API only
	cd apps/api && npm run dev

.PHONY: portal
portal: infra ## Start infra + web only
	cd apps/web && npm run dev

.PHONY: up
up: ## Start the full Docker Compose stack (all containers including Nginx)
	$(COMPOSE_FULL) up -d --build

# ── Lifecycle ────────────────────────────────────────────────

.PHONY: stop
stop: ## Gracefully stop dev infrastructure
	$(COMPOSE_DEV) stop
	$(COMPOSE_DEV) down

.PHONY: down
down: ## Stop and remove the full stack
	$(COMPOSE_FULL) down

.PHONY: clean
clean: ## Full reset — remove containers, volumes, and build cache
	$(COMPOSE_DEV) down -v --remove-orphans 2>/dev/null || true
	$(COMPOSE_FULL) down -v --remove-orphans 2>/dev/null || true
	@echo "Volumes and containers removed."

.PHONY: logs
logs: ## Tail logs from dev infrastructure
	$(COMPOSE_DEV) logs -f

.PHONY: logs-full
logs-full: ## Tail logs from the full stack
	$(COMPOSE_FULL) logs -f

# ── Database ─────────────────────────────────────────────────

.PHONY: dump
dump: ## Dump MongoDB to containers/mongo/dump/
	@echo "Dumping database..."
	mongodump --uri="$(MONGO_URI)/oauth_containers" \
		--archive=containers/mongo/dump/auto-dump.gz --gzip
	cp containers/mongo/dump/auto-dump.gz \
		"containers/mongo/dump/backup-$$(date +%Y%m%d-%H%M%S).gz"
	@echo "Dump complete."

.PHONY: restore
restore: ## Restore MongoDB from dump (override with FILE=path/to/archive.gz)
	mongorestore --uri="$(MONGO_URI)/oauth_containers" \
		--archive=$${FILE:-containers/mongo/dump/auto-dump.gz} --gzip --drop
	@echo "Restore complete."

# ── Testing ──────────────────────────────────────────────────

.PHONY: test
test: test-api test-web ## Run all tests

.PHONY: test-api
test-api: ## Run API unit tests
	cd apps/api && npm test

.PHONY: test-web
test-web: ## Run web unit tests
	cd apps/web && npm test

.PHONY: test-e2e
test-e2e: ## Run Playwright end-to-end tests
	cd apps/web && npm run test:e2e

# ── Status ───────────────────────────────────────────────────

.PHONY: status
status: ## Show which dev ports are in use
	@echo "Port status:"
	@printf "  API  (3001): " && (lsof -iTCP:3001 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "free")
	@printf "  Web  (5173): " && (lsof -iTCP:5173 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "free")
	@printf "  Mongo(27017): " && (lsof -iTCP:27017 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "free")
	@printf "  Redis(6379): " && (lsof -iTCP:6379 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "free")
	@printf "  Nginx(8000): " && (lsof -iTCP:8000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "free")

# ── Help ─────────────────────────────────────────────────────

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

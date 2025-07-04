COMPOSE := docker compose -f docker-compose.dev.yml --env-file $(CURDIR)/server/.env
CONTAINER_PREFIX := billing_system
DOCKER_USERNAME := billingsystemapp


include $(CURDIR)/scripts/postgres.make
include $(CURDIR)/scripts/redis.make
include $(CURDIR)/scripts/minio.make
include $(CURDIR)/scripts/minio.cli.make
include $(CURDIR)/scripts/server.make

ps:
	$(COMPOSE) ps --format "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
stats:
	$(COMPOSE) stats

up:
	test -f server/.env || cp server/env.example server/.env
	test -f server/.env.docker || cp server/env.docker.example server/.env.docker
	$(COMPOSE) up -d
	@$(COMPOSE) exec server sh -c 'sleep 5 && pnpm db:push && sleep 5 && pnpm seed'
	
restart:
	$(COMPOSE) down -v
	$(COMPOSE) up -d

up.build:
	$(COMPOSE) build
	$(COMPOSE) up -d 
	@$(COMPOSE) exec server sh -c 'sleep 5 && pnpm db:push && pnpm seed'

up.rebuild:
	$(COMPOSE) down -v
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

down.v:
	$(COMPOSE) down -v

config:
	$(COMPOSE) config

logs:
	$(COMPOSE) logs -f


kill.server.port.process:
	fuser -k 8080/tcp

local.ps:
	$(COMPOSE) ps --format "table {{.Service}} 	{{.ID}}	{{.Ports}} {{.Status}}"


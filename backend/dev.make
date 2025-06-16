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
	$(COMPOSE) up -d
	
restart:
	$(COMPOSE) down -v
	$(COMPOSE) up -d

up.build:
	$(COMPOSE) build --no-cache 
	$(COMPOSE) up -d 

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
	$(COMPOSE) ps --format "table {{.Service}} 		{{.ID}}		{{.Ports}}	{{.Status}}"


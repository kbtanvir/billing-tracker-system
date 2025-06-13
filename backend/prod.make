COMPOSE := docker-compose -f docker-compose.prod.yml --env-file $(CURDIR)/server/.env.production
CONTAINER_PREFIX := billing_system
DOCKER_USERNAME := billingsystemapp


 
include $(CURDIR)/scripts/server.make
 


up:
	$(COMPOSE) up -d
restart:
	$(COMPOSE) down 
	$(COMPOSE) up -d

up.build:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

config:
	$(COMPOSE) config
logs:
	$(COMPOSE) logs -f



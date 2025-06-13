IMAGE_NAME := server
TAG := prod
IMAGE_TAG := $(DOCKER_USERNAME)/$(IMAGE_NAME):$(TAG)
CONTAINER_NAME := $(CONTAINER_PREFIX)_server

server.exec:
	@$(COMPOSE) exec $(IMAGE_NAME) sh

# DEPLOY
# --------
server.logs:
	@$(COMPOSE) logs -f $(IMAGE_NAME) --tail 10

server.up:
	@$(COMPOSE) up $(IMAGE_NAME) -d

server.up.build:
	@$(COMPOSE) up --build $(IMAGE_NAME) -d

server.down:
	@$(COMPOSE) down $(IMAGE_NAME)

server.down.v:
	@$(COMPOSE) down $(IMAGE_NAME) -v

server.tag:
	$(eval CURRENT_IMAGE_ID := $(shell docker inspect --format='{{.Image}}' $(CONTAINER_NAME) | cut -d ':' -f2))
	docker tag $(CURRENT_IMAGE_ID) $(IMAGE_TAG)


server.restart: server.down server.up server.logs


# DEPLOY
# --------

server.push:
	docker push $(IMAGE_TAG)

docker.login:
	docker login

server.deploy: server.down.v server.up.build server.tag server.push 


# PULL
# --------

server.sync:
	@$(COMPOSE) pull server 
	@$(COMPOSE) up --build server -d --no-deps server
redis.exec:
	$(COMPOSE) exec redis sh

redis.cli:
	$(COMPOSE) exec redis redis-cli -p 6377

redis.up:
	$(COMPOSE) up redis -d

redis.down:
	$(COMPOSE) down redis

redis.down.v:
	$(COMPOSE) down redis -v

redis.restart:
	$(COMPOSE) restart redis

redis.rebuild:
	$(COMPOSE) down redis
	$(COMPOSE) up --build redis -d --no-deps
	$(COMPOSE) build redis

redis.logs:
	$(COMPOSE) logs -f redis

redis.replication-status-master:
	$(COMPOSE) exec redis redis-cli INFO replication
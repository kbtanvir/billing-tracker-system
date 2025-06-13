db.exec:
	$(COMPOSE) exec db sh

db.up:
	$(COMPOSE) up --build db -d 

db.down:
	$(COMPOSE) down db 
	

db.down.v:
	$(COMPOSE) down db -v

db.restart:
	$(COMPOSE) down db 
	$(COMPOSE) restart db

db.logs:
	$(COMPOSE) logs -f db

db.up.build:
	$(COMPOSE) up --build db -d
	$(COMPOSE) logs -f db
 
 
db.rebuild.nocache: db.down  
	$(COMPOSE) build --no-cache db
	$(COMPOSE) up -d
	$(COMPOSE) logs -f db

db.rebuild: db.down db.up.build 

db.rebuild.v: db.down.v db.up.build 

db.psql:
	$(COMPOSE) exec db psql -U postgres
 
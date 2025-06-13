minio.exec:
	$(COMPOSE) exec minio sh

minio.up:
	$(COMPOSE) up --build minio -d 

minio.down:
	$(COMPOSE) down minio 
	

minio.down.v:
	$(COMPOSE) down minio -v

minio.restart:
	$(COMPOSE) down minio 
	$(COMPOSE) restart minio

minio.logs:
	$(COMPOSE) logs -f minio

minio.up.build:
	$(COMPOSE) up --build minio -d
 
 
minio.rebuild.nocache: minio.down  
	$(COMPOSE) build --no-cache minio
	$(COMPOSE) up -d

minio.rebuild: minio.down minio.up.build 

minio.rebuild.v: minio.down.v minio.up.build 

mc.ls:
	$(COMPOSE) exec mc mc ls s3

mc.ls.bucket:
	$(COMPOSE) exec mc mc ls s3/billingsystem
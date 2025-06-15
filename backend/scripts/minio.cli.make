minio.cli.exec:
	$(COMPOSE) exec minio-cli sh
	
minio.cli.up:
	$(COMPOSE) up minio-cli -d
	$(COMPOSE) logs minio-cli -f

minio.cli.up.build:
	$(COMPOSE) up --build minio-cli -d
 

minio.cli.logs:
	$(COMPOSE) logs -f minio-cli

minio.cli.down.v:
	$(COMPOSE) down minio-cli -v

minio.cli.rebuild: minio.cli.down.v minio.cli.up.build minio.cli.logs
 

minio.cli.ls:
	$(COMPOSE) exec mc mc ls s3

minio.cli.ls.bucket:
	$(COMPOSE) exec mc mc ls s3/public
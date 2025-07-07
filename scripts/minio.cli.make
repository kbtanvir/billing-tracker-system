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

minio.cli.generate.keys:
	# Generate access keys for the application user
	$(COMPOSE) exec minio-cli /usr/bin/mc admin accesskey create s3 "${APP_USER}" \
		--access-key "${S3_ACCESS_KEY}123" \
		--secret-key "${S3_SECRET_KEY}"; \

	# Update only S3 credentials in existing .env file
	echo "Updating S3 credentials in .env file..."
	if [ -f "/tmp/.env" ]; then \
		cp /tmp/.env /tmp/.env.tmp && \
		grep -q "^S3_ACCESS_KEY=" /tmp/.env.tmp && \
			sed -i "s/^S3_ACCESS_KEY=.*/S3_ACCESS_KEY=${S3_SECRET_KEY}/" /tmp/.env.tmp || \
			echo "S3_ACCESS_KEY=${S3_SECRET_KEY}" >> /tmp/.env.tmp; \
		grep -q "^S3_SECRET_KEY=" /tmp/.env.tmp && \
			sed -i "s/^S3_SECRET_KEY=.*/S3_SECRET_KEY=${SECRET_KEY}/" /tmp/.env.tmp || \
			echo "S3_SECRET_KEY=${SECRET_KEY}" >> /tmp/.env.tmp; \
		mv /tmp/.env.tmp /tmp/.env; \
	else \
		echo "S3_ACCESS_KEY=${S3_SECRET_KEY}" > /tmp/.env; \
		echo "S3_SECRET_KEY=${S3_SECRET_KEY}" >> /tmp/.env; \
	fi
	chmod 600 /tmp/.env
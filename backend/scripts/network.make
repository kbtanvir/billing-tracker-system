nginx.exec:
	$(COMPOSE) exec nginx sh
	
nginx.up:
	$(COMPOSE) up --build nginx -d 
	$(COMPOSE) logs -f nginx

nginx.down:
	$(COMPOSE) down nginx 

nginx.down.v:
	$(COMPOSE) down nginx -v

nginx.restart:
	$(COMPOSE) down nginx 
	$(COMPOSE) restart nginx

nginx.logs:
	$(COMPOSE) logs -f nginx

nginx.rm:
	$(COMPOSE) rm -f nginx

nginx.tail.error:
	$(COMPOSE) exec nginx tail -f /data/logs/fallback_error.log

nginx.rebuild: nginx.down 
	$(COMPOSE) up --build -d nginx
	$(COMPOSE) exec nginx tail -f /data/logs/fallback_error.log

nginx.rebuild.v: nginx.down.v 
	$(COMPOSE) up --build -d nginx
	$(COMPOSE) logs -f nginx

nginx.rebuild.nocache: nginx.down  
	$(COMPOSE) build --no-cache nginx
	$(COMPOSE) up -d

nginx.reload:
	$(COMPOSE) exec nginx nginx -s reload

nginx.test:
	$(COMPOSE) exec nginx nginx -t


nginx.link:
	$(COMPOSE) exec nginx ln -s /etc/nginx/sites-available/site.localhost /etc/nginx/sites-enabled/site.localhost
	$(COMPOSE) exec nginx ln -s /etc/nginx/sites-available/boosterorbit.com /etc/nginx/sites-enabled/boosterorbit.com

certbot.exec:
	$(COMPOSE) exec certbot sh

certbot.ssl.gen:
	$(COMPOSE) certbot certonly --webroot --webroot-path=/var/www/certbot --email hello@billingsystem.com --agree-tos --no-eff-email -d boosterorbit.com




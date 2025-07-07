FROM postgres:16-alpine

RUN apk add --no-cache gettext

# Copy the initialization script into the container
COPY init-db.sh /docker-entrypoint-initdb.d/

# Make sure the script is executable
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh
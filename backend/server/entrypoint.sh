#!/bin/sh

# Wait for PostgreSQL port to be available
# timeout=30
# while ! (timeout 1 bash -c 'cat < /dev/null > /dev/tcp/db/5432') 2>/dev/null; do
#   sleep 1
#   timeout=$((timeout-1))
#   [ $timeout -le 0 ] && echo "Timeout waiting for DB" && exit 1
# done

# Proceed with migrations and startup
 
exec db:push && seed && pnpm start:prod
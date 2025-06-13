# redis/Dockerfile
FROM redis:7.2.6-alpine

# Copy redis config
COPY redis.conf /usr/local/etc/redis/redis.conf

# Set permissions
RUN chmod 644 /usr/local/etc/redis/redis.conf

# Use redis config
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
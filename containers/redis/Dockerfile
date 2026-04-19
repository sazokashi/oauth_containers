FROM redis:7-alpine

COPY redis.conf /usr/local/etc/redis/redis.conf

# Run as non-root redis user
USER redis

EXPOSE 6379

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]

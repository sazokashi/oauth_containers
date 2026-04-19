FROM mongo:7.0

# Install mongodb-database-tools for mongodump/mongorestore
RUN apt-get update && apt-get install -y mongodb-database-tools && rm -rf /var/lib/apt/lists/*

COPY mongod.conf /etc/mongod.conf
COPY init/ /docker-entrypoint-initdb.d/
COPY entrypoint-wrapper.sh /usr/local/bin/entrypoint-wrapper.sh

RUN chmod +x /usr/local/bin/entrypoint-wrapper.sh

EXPOSE 27017

ENTRYPOINT ["entrypoint-wrapper.sh"]
CMD ["mongod", "--config", "/etc/mongod.conf"]

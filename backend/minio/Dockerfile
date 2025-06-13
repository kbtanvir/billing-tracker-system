FROM minio/mc:latest

# Copy the entrypoint script into the container
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Make the script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the default entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

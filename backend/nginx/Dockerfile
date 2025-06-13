# Use the official NGINX image
FROM nginx:latest

# Copy custom NGINX configuration
COPY conf.d /etc/nginx/conf.d

# Expose ports
EXPOSE 80
EXPOSE 443

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
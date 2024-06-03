# Install the base image
FROM nginx:latest

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy the static site files
COPY index.html /usr/share/nginx/html/

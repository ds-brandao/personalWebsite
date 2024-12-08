FROM nginx:latest

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy static site files (as a fallback; in dev we use volumes)
COPY index.html /usr/share/nginx/html/
COPY config /usr/share/nginx/html/config
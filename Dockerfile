# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy React app files
COPY react-app/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY react-app/ ./

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

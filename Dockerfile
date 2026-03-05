FROM node:20-alpine AS dependencies
WORKDIR /app
COPY next-app/package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY next-app/ .
ARG COMMIT_SHA=unknown
ENV NODE_ENV=production
ENV COMMIT_SHA=$COMMIT_SHA
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install all workspace dependencies
RUN npm install --workspace=@codemap/api --workspace=@codemap/shared

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Build the API
RUN cd apps/api && npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy built output
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]

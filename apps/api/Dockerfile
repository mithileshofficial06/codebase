# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install --workspace=@codemap/api --workspace=@codemap/shared
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/
RUN cd apps/api && npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]

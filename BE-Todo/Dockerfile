# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy source code and build TypeScript
COPY . .
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

# Copy seed files (optional, for seeding data)
# seed.js không còn tồn tại nên tạm thời comment lại để docker build không bị lỗi
# COPY seed.js ./
# COPY seed-data.json ./

# Expose application port
EXPOSE 8000

# Start the application
CMD ["node", "dist/index.js"]

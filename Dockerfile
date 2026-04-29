# syntax=docker/dockerfile:1.4
# Dockerfile for Next.js application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Use BuildKit cache mount for npm cache (faster rebuilds)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Rebuild the source code only when needed
# Use node:20-slim for builder (has glibc for Next.js SWC)
FROM node:20-slim AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js with cache mount for .next/cache
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.next/cache \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Set timezone to Asia/Bangkok (UTC+7)
RUN apk add --no-cache tzdata
ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from standalone build
# Next.js standalone build includes public folder in .next/standalone if it exists
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public folder (required for static assets like images, icons, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 4101

ENV PORT=4101
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]


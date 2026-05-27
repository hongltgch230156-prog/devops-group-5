# ===========================================
# STUDENT TODO: Create a Multi-Stage Dockerfile
# ===========================================
#
# Requirements:
# 1. Stage 1 (builder):
#    - Use node:18-alpine as base
#    - Set working directory
#    - Copy package files and install ALL dependencies
#    - Copy source code
#
# 2. Stage 2 (production):
#    - Use node:18-alpine as base
#    - Set working directory
#    - Copy only package files from builder
#    - Install ONLY production dependencies (hint: --only=production)
#    - Copy application code from builder
#    - Expose the correct port
#    - Set the start command
#
# Hints:
# - Research: "Docker multi-stage build Node.js"
# - Use COPY --from=builder to copy between stages
# - Final image should be as small as possible
# ===========================================

# YOUR CODE HERE:
    # =========================
# Builder Stage
# =========================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# =========================
# Production Stage
# =========================
FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy app source
COPY --from=builder /app .

# Expose backend port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]

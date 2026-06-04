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

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

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
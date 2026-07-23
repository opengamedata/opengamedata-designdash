# syntax=docker/dockerfile:1

# --- deps ---
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- build ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

ARG DEPLOY_TARGET=cloudrun
ARG NEXT_PUBLIC_OGD_FILES_API_URL=
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ARG NEXT_PUBLIC_AI_ASSISTANT_ENABLED=false

ENV DEPLOY_TARGET=${DEPLOY_TARGET}
ENV NEXT_PUBLIC_OGD_FILES_API_URL=${NEXT_PUBLIC_OGD_FILES_API_URL}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
ENV NEXT_PUBLIC_AI_ASSISTANT_ENABLED=${NEXT_PUBLIC_AI_ASSISTANT_ENABLED}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# --- runtime ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]

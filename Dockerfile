# Build the static site, then run the small Node server that serves it
# and handles form submissions. Used by Cloud Run (see cloudbuild.yaml).
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "server/index.mjs"]

# Build stage — compilation Nuxt (sur le runner CI / machine de dev)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage — process Nitro permanent
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output .output
COPY --from=build /app/node_modules node_modules
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

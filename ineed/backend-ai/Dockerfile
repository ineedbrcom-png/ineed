FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Se houver build (Nest/Vite/etc.), roda; se não houver, segue em frente
RUN npm run build || echo "No build step, will run with npm start"

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# Dependências e artefatos
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
EXPOSE 3000
# Se existir dist, roda Node direto; senão, cai no npm start
CMD ["sh","-c","[ -d dist ] && node dist/main.js || npm start"]

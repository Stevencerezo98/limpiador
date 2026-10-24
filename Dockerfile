# Multi-stage Dockerfile para CleanMail en Producción
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar cliente estático para producción
COPY . .
RUN npm run build

# Etapa final ligera
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copiar dependencias de producción y build compilado
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

# Exponer el puerto configurado
EXPOSE 3000

# Iniciar servidor Node
CMD ["node", "server.ts"]

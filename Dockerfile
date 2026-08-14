FROM node:20-alpine

WORKDIR /app

# Install openssl (required by Prisma on alpine)
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

# Auto-generate JWT secret if unset, wait for Postgres, migrate, seed, start
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]

FROM node:20-alpine

WORKDIR /app

# Install openssl (required by Prisma on alpine)
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 8000

# Wait for Postgres, apply migrations, seed, then start
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node src/server.js"]

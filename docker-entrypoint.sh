#!/bin/sh
set -e

# Auto-generate a JWT secret if none is provided (or the insecure default is
# still in place). Generated secrets are session-only: set JWT_SECRET explicitly
# if you need tokens to survive container restarts.
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-secret-key-change-this-in-production" ]; then
  export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
  echo "JWT_SECRET not set - generated a random one for this session."
  echo "Set JWT_SECRET explicitly to keep tokens valid across restarts."
fi

npx prisma migrate deploy
node prisma/seed.js
node src/server.js

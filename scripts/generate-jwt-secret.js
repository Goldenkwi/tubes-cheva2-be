const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const secret = crypto.randomBytes(32).toString('hex');
const envPath = path.resolve(__dirname, '..', '.env');

let content = '';
try {
  content = fs.readFileSync(envPath, 'utf-8');
} catch {
  content = fs.readFileSync(path.resolve(__dirname, '..', '.env.example'), 'utf-8');
}

if (content.includes('JWT_SECRET=')) {
  content = content.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${secret}`);
} else {
  content += `\nJWT_SECRET=${secret}\n`;
}

fs.writeFileSync(envPath, content, 'utf-8');
console.log(`JWT_SECRET=${secret}`);

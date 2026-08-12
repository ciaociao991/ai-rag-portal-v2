FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

ENV PORT=3000

EXPOSE 3000

CMD ["node", ".next/standalone/server.js", "-p", "${PORT:-3000}"]



FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build

# Usa una porta fissa perché Railway non può leggere $PORT durante la build
ENV PORT=3000

# Espone la porta corretta
EXPOSE 3000

# Avvia Next.js sulla porta corretta
CMD ["npm", "run", "start", "--", "-p", "3000"]


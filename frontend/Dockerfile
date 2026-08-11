FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build

# Railway sets PORT automatically
ENV PORT=$PORT

# Expose the port Railway will use
EXPOSE $PORT

# Start Next.js on the correct port
CMD ["npm", "run", "start", "--", "-p", "$PORT"]


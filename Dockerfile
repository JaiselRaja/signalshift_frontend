FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

EXPOSE 3001

# Dev mode with hot-reload
CMD ["npm", "run", "dev"]

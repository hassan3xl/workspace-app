# Use the lightweight Alpine version
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first to save time on builds
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Standard Next.js dev command
CMD ["npm", "run", "dev"]
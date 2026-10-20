FROM node:18-alpine

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
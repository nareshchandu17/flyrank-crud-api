FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

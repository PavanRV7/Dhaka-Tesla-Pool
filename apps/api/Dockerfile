FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY . .
RUN npm install
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["npm", "run", "dev"]

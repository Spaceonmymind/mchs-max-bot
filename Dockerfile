FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Порт админки
EXPOSE 3030

CMD ["npm", "start"]

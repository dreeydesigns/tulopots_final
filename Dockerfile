FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate && npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
FROM node:lts-alpine

WORKDIR /usr/src/gachicostas-bot

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 80

CMD [ "node", "dist/main.js" ]
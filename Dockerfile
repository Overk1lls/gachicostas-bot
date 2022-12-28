FROM node:18 AS development

WORKDIR /usr/gachicostas-bot

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

FROM node:18 AS build

WORKDIR /usr/gachicostas-bot

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/gachicostas-bot/node_modules ./node_modules  

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV=production

RUN npm ci --omit=dev

RUN npm cache clean --force

USER node

FROM node:18 AS production

COPY --chown=node:node --from=build /usr/gachicostas-bot/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/gachicostas-bot/dist ./dist

CMD [ "node", "dist/main.js" ]

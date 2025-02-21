FROM node:22-alpine

RUN mkdir -p /home/node22/app/node_modules && chown -R node:node /home/node22/app

WORKDIR /home/node22/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "main.js" ]
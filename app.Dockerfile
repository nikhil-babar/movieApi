FROM node:alpine

WORKDIR /app

COPY package.json package.json

RUN npm install

CMD [ "node", "app.js" ]
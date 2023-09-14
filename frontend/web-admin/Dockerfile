FROM node:alpine

WORKDIR /app
COPY ./app/package*.json ./
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm install
COPY ./settings/.env.development ./
COPY ./app ./

CMD ["npm", "run", "dev"]
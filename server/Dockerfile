FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN if [ -f .env ]; then cp .env.docker .env; fi

RUN pnpm run build

CMD pnpm run start:prod
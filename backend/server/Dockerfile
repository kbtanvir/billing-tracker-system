FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Replace .env with .env.production
RUN if [ -f .env ]; then cp .env.docker .env; fi

RUN pnpm run build

CMD pnpm run db:push && pnpm run start:prod

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://server:8080/api/health-check || exit 1



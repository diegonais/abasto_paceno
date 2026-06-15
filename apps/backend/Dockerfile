FROM node:20-alpine

WORKDIR /workspace

COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/package.json

RUN yarn install --frozen-lockfile || yarn install

COPY apps/backend ./apps/backend

EXPOSE 3000

CMD ["sh", "-c", "yarn install --frozen-lockfile || yarn install && yarn workspace backend start:dev"]

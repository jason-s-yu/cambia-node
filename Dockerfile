FROM node:lts-alpine AS deps
LABEL AUTHOR='Jason Yu'

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-

FROM node:lts-alpine AS builder

WORKDIR /app

COPY . .

COPY --from=deps /app/node_modules ./node_modules

RUN yarn build

FROM node:alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

CMD ["yarn", "serve"]

EXPOSE 3000

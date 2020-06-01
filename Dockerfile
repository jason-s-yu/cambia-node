FROM node:lts-alpine
LABEL AUTHOR='Jason Yu'

RUN mkdir /app
COPY . /app
WORKDIR /app

RUN yarn install
RUN yarn build

CMD ["yarn", "serve"]

EXPOSE 3000
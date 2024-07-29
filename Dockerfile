# build-stage
FROM node:18 AS build-stage
ENV CI=1
WORKDIR /app

## copy source
COPY . .

## install and build
RUN npm i pnpm -g
RUN pnpm i --frozen-lockfile
RUN pnpm run build

RUN rm -rf node_modules
RUN pnpm i --production --ignore-scripts --prefer-offline --frozen-lockfile

# run-stage
FROM node:18
ENV CI=1
WORKDIR /app

## copy dist
COPY --from=build-stage /app  /app

CMD ["node", "/app/dist/main.js"]
# CMD ["tail","-f","/dev/null"]
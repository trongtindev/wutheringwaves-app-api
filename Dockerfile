# build-stage
FROM oven/bun:1 AS build-stage
ENV CI=1
WORKDIR /app

## copy source
COPY . .

## install and build
RUN bun i --frozen-lockfile
RUN bun run build

RUN rm -rf node_modules
RUN bun i --production --ignore-scripts --prefer-offline --frozen-lockfile

# run-stage
FROM oven/bun:1
ENV CI=1
WORKDIR /app

## copy dist
COPY --from=build-stage /app  /app

CMD ["bun", "/app/dist/main.js"]
# CMD ["tail","-f","/dev/null"]
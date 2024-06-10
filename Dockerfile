## init
FROM node:18 as build-stage
WORKDIR /home
ENV CI=1

# setup pnpm
RUN npm i -g pnpm

# build application
COPY . .
RUN pnpm install
RUN pnpm run build
RUN npm rebuild --verbose sharp


## init
FROM node:18
ENV CI=1
ENV NODE_ENV production
ENV TZ=Asia/Ho_Chi_Minh
WORKDIR /home

# setup packages
RUN npm i pm2 -g
RUN npm i -g pnpm

# copy application from build
COPY --from=build-stage /home  /home

# CMD ["pnpm", "run", "start"]
CMD ["pm2-runtime", "/home/dist/main.js"]

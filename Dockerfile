FROM node:18-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN npm i -g pnpm
WORKDIR /app

COPY package.json .
RUN NODE_ENV=development pnpm i

COPY . .
RUN pnpm build

CMD ["node", "build"]

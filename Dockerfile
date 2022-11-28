FROM node:18-alpine

ARG NODE_ENV=production
ARG URL
ARG BTC
ARG SOCKET

ENV NODE_ENV $NODE_ENV
ENV PUBLIC_COINOS_URL $URL
ENV PUBLIC_BTC $BTC
ENV PUBLIC_SOCKET $SOCKET

RUN npm i -g pnpm
WORKDIR /app

ADD package.json .
RUN --mount=type=cache,target=/root/.local/share/pnpm/store NODE_ENV=development pnpm i

COPY . .
RUN pnpm build

CMD ["node", "build"]

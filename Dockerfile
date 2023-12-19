FROM node:21-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN npm i -g pnpm
WORKDIR /app

ADD package.json .
RUN --mount=type=cache,target=/root/.local/share/pnpm/store NODE_ENV=development pnpm i

COPY . .
RUN pnpm build

# CMD ["node", "build"]
CMD ["pnpm", "preview", "--host", "--port", "3000"]

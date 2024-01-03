FROM node:21

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN npm i -g bun
WORKDIR /app

ADD package.json .
RUN NODE_ENV=development bun i

COPY . .
RUN bun run build

# CMD ["node", "build"]
CMD ["bun", "run", "preview", "--host", "--port", "3000"]

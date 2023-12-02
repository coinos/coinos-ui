FROM oven/bun

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY . .
RUN bun i
RUN bun run build

WORKDIR /home/bun/app/build

CMD ["bun", "run", "start"]

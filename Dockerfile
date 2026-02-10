FROM oven/bun

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

WORKDIR /app

ADD package.json .
RUN NODE_ENV=development bun i

COPY . .

ARG BUILD_MODE=build
RUN bun run $BUILD_MODE

# CMD ["node", "build"]
CMD ["bun", "run", "preview", "--host", "--port", "3000"]

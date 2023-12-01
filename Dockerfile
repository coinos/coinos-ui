FROM oven/bun

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY . .
RUN bun i
RUN bun run build

# CMD ["node", "build"]
CMD ["bun", "run", "--bun", "preview", "--host", "--port", "3000"]

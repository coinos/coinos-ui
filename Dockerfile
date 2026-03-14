FROM oven/bun

WORKDIR /app

ADD package.json bun.lockb .
RUN NODE_ENV=development bun i --frozen-lockfile

COPY . .

ARG VITE_MODE=production
RUN rm -f .env .env.local .env.production.local && \
    NODE_ENV=production bunx vite build --mode $VITE_MODE

ENV NODE_ENV=production

CMD ["bun", "./build/index.js"]

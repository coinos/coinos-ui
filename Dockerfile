FROM oven/bun

WORKDIR /app

ADD package.json .
RUN NODE_ENV=development bun i

COPY . .

ARG VITE_MODE=production
RUN rm -f .env .env.local .env.production .env.production.local && \
    NODE_ENV=production bunx vite build --mode $VITE_MODE

ENV NODE_ENV=production

CMD ["bun", "run", "preview", "--host", "--port", "3000"]

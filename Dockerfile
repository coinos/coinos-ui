FROM gcr.io/coinos-326717/github.com/coinos/coinos-ui:base

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app
COPY . .
RUN mv /deps/node_modules /app
RUN pnpm build

CMD ["node", "build"]

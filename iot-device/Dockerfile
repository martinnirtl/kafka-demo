FROM node:14.17-alpine3.12

WORKDIR /usr/src/app

COPY ./iot-device/package*.json ./

RUN npm install --only=prod

COPY ./iot-device .
COPY ./protos ./protos

ENV NODE_ENV production

# NOTE enables graceful shutdown > https://medium.com/@gchudnov/trapping-signals-in-docker-containers-7a57fdda7d86
ENTRYPOINT ["node", "src/index.js"]

USER node

# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md

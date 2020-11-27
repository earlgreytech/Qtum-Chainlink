FROM node:11.15.0

RUN mkdir -p /home/qtumtx-adapter/src/node_modules
RUN mkdir -p /home/chainlink-api-client/src

COPY ./qtumtx-adapter/src/package*.json /home/qtumtx-adapter/src/
COPY ./chainlink-api-client/package*.json /home/chainlink-api-client/

RUN chown -R node:node /home/

USER node

WORKDIR /home/qtumtx-adapter/src

RUN npm install 2>&1 \
    && mv /home/qtumtx-adapter/src/node_modules /home/qtumtx-adapter/
RUN rm /home/qtumtx-adapter/node_modules/chainlink-api-client
RUN ln -s /home/chainlink-api-client/src /home/qtumtx-adapter/node_modules/chainlink-api-client

COPY --chown=node:node . .

ENTRYPOINT ["npm"]
CMD ["run", "dev"]

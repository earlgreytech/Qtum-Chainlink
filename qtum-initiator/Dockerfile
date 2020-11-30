FROM node:11.15.0

RUN mkdir -p /home/qtum-initiator/src/node_modules
RUN mkdir -p /home/chainlink-api-client/src

COPY ./qtum-initiator/src/package*.json /home/qtum-initiator/src/
COPY ./chainlink-api-client/package*.json /home/chainlink-api-client/

RUN chown -R node:node /home/

USER node

WORKDIR /home/qtum-initiator/src

RUN npm install 2>&1 \
    && mv /home/qtum-initiator/src/node_modules /home/qtum-initiator/
RUN rm /home/qtum-initiator/node_modules/chainlink-api-client
RUN ln -s /home/chainlink-api-client/src /home/qtum-initiator/node_modules/chainlink-api-client

COPY --chown=node:node . .

ENTRYPOINT ["npm"]
CMD ["run", "dev"]

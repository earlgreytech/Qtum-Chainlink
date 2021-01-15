FROM node:11.15.0

RUN mkdir -p /home/automated-deployment/src/node_modules
RUN mkdir -p /home/chainlink-api-client/src

COPY ./automated-deployment/src/package*.json /home/automated-deployment/src/
COPY ./chainlink-api-client/package*.json /home/chainlink-api-client/

RUN chown -R node:node /home/

USER node

WORKDIR /home/automated-deployment/src

RUN mkdir /home/automated-deployment/artifacts
RUN mkdir /home/automated-deployment/config

RUN npm install 2>&1 \
    && mv /home/automated-deployment/src/node_modules /home/automated-deployment
RUN rm /home/automated-deployment/node_modules/chainlink-api-client
RUN ln -s /home/chainlink-api-client/src /home/automated-deployment/node_modules/chainlink-api-client

COPY --chown=node:node . .

ENTRYPOINT ["npm"]
CMD ["run", "dev"]
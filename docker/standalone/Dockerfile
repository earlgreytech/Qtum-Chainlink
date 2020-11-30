FROM golang:1.14-alpine

RUN apk add --no-cache make musl-dev git

RUN go get github.com/qtumproject/janus/...

ENV QTUM_RPC=http://qtum:testpasswd@localhost:3889
ENV QTUM_NETWORK=regtest

EXPOSE 23889

ENTRYPOINT [ "janus"]
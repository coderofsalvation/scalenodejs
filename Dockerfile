FROM node:17-alpine3.14 as builder

# Install all dependencies required for compiling thttpd
RUN apk add gcc musl-dev make g++ util-linux make git bash busybox-extras libc6-compat python3 

ADD . .

ENV CFLAGS=-U_FORTIFY_SOURCE
ENV CXXFLAGS=-U_FORTIFY_SOURCE
ENV LDFLAGS=Wl,-no-pie

# Create a non-root user to own the files and run our server
RUN adduser -D app
RUN npm install && npm install pkg 
RUN node_modules/.bin/pkg -d -t alpine server.js -o /server

# Switch to the scratch image
FROM alpine:3.14

EXPOSE 3000

# Copy over the user
COPY --from=builder /etc/passwd /etc/passwd

# Copy the thttpd static binary
COPY --from=builder /server /server
COPY --from=builder /service /.
COPY --from=builder /test/data /test/data

# Use our non-root user
USER app
WORKDIR /

cmd ["/app"]

FROM node:12
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm install
EXPOSE 8999
CMD node ./dist/server/server.js

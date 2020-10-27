FROM node:12
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm install
EXPOSE 4200
CMD echo "Warming up" && sleep 5 && npm start

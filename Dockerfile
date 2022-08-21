FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3062
RUN npm run dev
CMD ["node", "server.js"]
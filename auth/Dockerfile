FROM node:alpine
WORKDIR /app
COPY . .
RUN npm install --only=prod

CMD ["npm", "start"]
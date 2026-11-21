FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY config ./config
COPY models ./models
COPY routes ./routes
COPY utils ./utils
COPY server.js ./

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]

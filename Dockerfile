FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

# Run the app specified by the APP argument
ARG APP
ENV APP_NAME=${APP}

RUN npm run build ${APP_NAME}

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]

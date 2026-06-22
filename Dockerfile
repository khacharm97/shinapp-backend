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

RUN npx nest build ${APP_NAME}

RUN ls -la /app/dist/apps/ || echo "No dist/apps folder"

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/apps/${APP_NAME}/main.js"]

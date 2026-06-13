FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate
RUN npx prisma db push

COPY . .

# Run the app specified by the APP argument
ARG APP
ENV APP_NAME=${APP}

RUN npx nest build ${APP_NAME}

RUN ls -la /app/dist/apps/ || echo "No dist/apps folder"

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]

FROM node:24-slim AS build

WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# use the Nginx image to serve the app
FROM nginx:alpine

# COPY nginx.conf /etc/nginx/nginx.conf
COPY app.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

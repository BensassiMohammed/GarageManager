# Stage 1: Build Angular app
FROM node:20.19.0-alpine AS build

ARG PROFILE=production
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration=$PROFILE

# Stage 2: Run with Nginx
FROM nginx:1.25-alpine

# Copy compiled Angular app (fix folder name if needed)
COPY --from=build /app/dist/garage-frontend /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional: prepare template for envsubst
RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/index.template.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

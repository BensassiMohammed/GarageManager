# Stage 1: Compile and Build Angular codebase
FROM node:20.10.0-alpine AS build

ARG PROFILE=production
ARG BUILD_VERSION=1.0.0
ARG APP_VERSION=1.0.0

ENV PROFILE=${PROFILE}
ENV BUILD_VERSION=${BUILD_VERSION}
ENV APP_VERSION=${APP_VERSION}

WORKDIR /usr/local/app
COPY ./ /usr/local/app/
RUN npm install
RUN npm run build --configuration=$PROFILE

# Stage 2: Serve app with nginx server
FROM nginx:latest

# Copy compiled Angular app
COPY --from=build /usr/local/app/dist/garage-frontend /usr/share/nginx/html

# Copy custom nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Rename index.html -> index.template.html for envsubst
RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/index.template.html

EXPOSE 80

# Inject runtime values into env.js and index.html at container startup
CMD ["/bin/sh", "-c", "\
  envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && \
  envsubst < /usr/share/nginx/html/index.template.html > /usr/share/nginx/html/index.html && \
  exec nginx -g 'daemon off;'"]

# Stage 1: Compile and Build Angular codebase
# Utilise l'image Node.js Alpine pour construire l'application Angular
FROM node:20.19.0-alpine AS build

# Définition des arguments de build pour le profil, la version de build et la version de l'application
ARG PROFILE=production
ARG BUILD_VERSION=1.0.0
ARG APP_VERSION=1.0.0

# Définition des variables d'environnement à partir des arguments
ENV PROFILE=${PROFILE}
ENV BUILD_VERSION=${BUILD_VERSION}
ENV APP_VERSION=${APP_VERSION}

# Définit le répertoire de travail dans le conteneur
WORKDIR /usr/local/app

# Copie tous les fichiers du projet dans le conteneur
COPY ./ /usr/local/app/

# Installe les dépendances Node.js
RUN npm install
# Compile l'application Angular selon le profil spécifié
RUN npm run build

# Stage 2: Serve app with nginx server
# Utilise l'image officielle Nginx pour servir l'application compilée
FROM nginx:latest

# Copie l'application Angular compilée depuis le conteneur de build vers le dossier de distribution Nginx
COPY --from=build /usr/local/app/dist/garage-frontend/browser /usr/share/nginx/html

# Copie la configuration personnalisée de Nginx dans le conteneur
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Renomme index.html en index.html pour permettre l'injection de variables d'environnement au démarrage
#RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html

# Expose le port 80 pour le serveur web
EXPOSE 80

# Démarre Nginx en mode premier plan (foreground) pour servir l'application
CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;'"]

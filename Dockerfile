# Étape 1 : Build Astro
FROM node:lts AS build
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build

# Étape 2 : Servez les fichiers statiques avec Apache
FROM httpd:2.4
COPY --from=build /app/dist/ /usr/local/apache2/htdocs/
# (optionnel) Désactive les fichiers .htaccess si besoin : 
# RUN sed -i 's/AllowOverride All/AllowOverride None/g' /usr/local/apache2/conf/httpd.conf

# (optionnel mais conseillé pour les SPA : fallback 404 vers index.html)
RUN echo 'ErrorDocument 404 /index.html' >> /usr/local/apache2/conf/httpd.conf

# Expose le port Apache (modifie le port si tu veux)
EXPOSE 8080

# Change le port par défaut d'Apache (sinon il reste sur 80)
RUN sed -i 's/Listen 80/Listen 8080/g' /usr/local/apache2/conf/httpd.conf

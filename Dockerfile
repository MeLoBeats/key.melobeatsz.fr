FROM node:lts AS build
WORKDIR /app

# Installe pnpm globalement
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie seulement le manifest et le lock pour profiter du cache Docker
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copie le reste du projet (src, public, etc)
COPY . .

RUN pnpm run build

FROM httpd:2.4
COPY --from=build /app/dist/ /usr/local/apache2/htdocs/
RUN echo 'ErrorDocument 404 /index.html' >> /usr/local/apache2/conf/httpd.conf
EXPOSE 8080
RUN sed -i 's/Listen 80/Listen 8080/g' /usr/local/apache2/conf/httpd.conf

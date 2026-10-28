# Etapa 1: Construcción (Node 20+ slim para compatibilidad con Vite/Rolldown y glibc)
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor Web Nginx (Imagen final ultraliviana)
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
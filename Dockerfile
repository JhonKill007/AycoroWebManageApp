# # Etapa 1: build
# FROM node:lts-bullseye AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# ENV GENERATE_SOURCEMAP=false
# RUN npm run build

# # Etapa 2: servidor Nginx
# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html
# # Bloquear source maps opcionalmente
# RUN rm -f /usr/share/nginx/html/*.map

# # Configuración básica de Nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

FROM node:lts-bullseye AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]

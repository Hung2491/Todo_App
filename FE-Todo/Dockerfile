# Stage 1: Build
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine

# Tạo thư mục và copy code
RUN mkdir -p /usr/share/nginx/html/todo-app
COPY --from=build-stage /app/dist /usr/share/nginx/html/todo-app

# Xóa config mặc định và templates để tránh envsubst ghi đè file mount
RUN rm -rf /etc/nginx/conf.d/default.conf /etc/nginx/templates

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

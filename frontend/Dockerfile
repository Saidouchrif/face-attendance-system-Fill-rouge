# ============================
# 1. Base Image (deps layer)
# ============================
FROM node:20-alpine AS deps
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# ============================
# 2. Runtime image
# ============================
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# ============================
# 3. Vite dev server
# ============================
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

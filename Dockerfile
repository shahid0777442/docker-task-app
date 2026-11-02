# 1. Chhoti base image
FROM node:20-alpine

# 2. Working directory
WORKDIR /app

# 3. Pehle sirf package files (layer caching)
COPY package*.json ./

# 4. Sirf production dependencies
RUN npm install --omit=dev && npm cache clean --force

# 5. Baqi source code
COPY . .

# 6. Port document karein
EXPOSE 3000

# 7. Non-root user (security)
USER node

# 8. Start command
CMD ["node", "server.js"]

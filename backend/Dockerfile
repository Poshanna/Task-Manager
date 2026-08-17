# Node.js Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend code
COPY . .

# Expose API port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]

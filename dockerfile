# Use the official Node.js image as the base image
FROM node:22-alpine

# Create app directory and set permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Set working directory
WORKDIR /home/node/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies as root user
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY --chown=node:node . .

# Build the Next.js application
RUN npm run build

# Switch to non-root user
USER node

# Expose the port the app runs on
EXPOSE 80

# Command to run the application
CMD [ "npm", "start" ]
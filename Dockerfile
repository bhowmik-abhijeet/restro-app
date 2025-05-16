# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY src src
COPY tsconfig.json .

# Expose the port the app runs on
EXPOSE 3000

# Command to start the application
CMD ["npm", "run", "serve"]
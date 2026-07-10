# Use official Playwright Ubuntu-based Jammy image which contains pre-installed browsers
FROM mcr.microsoft.com/playwright:v1.44.1-jammy

# Set workspace directory inside container
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy the source code
COPY . .

# Compile TypeScript code
RUN npm run build

# Default command to run the dev environment tests
CMD ["npm", "run", "test"]

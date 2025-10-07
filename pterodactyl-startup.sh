#!/bin/bash

# InfoPanel Pterodactyl Startup Script
# This script builds and starts the InfoPanel application

echo "Starting InfoPanel deployment..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application
echo "Building application..."
npm run build

# Start the server
echo "Starting InfoPanel server..."
npm start

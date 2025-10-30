#!/bin/bash
set -e

echo "Starting build process..."

# Clean any existing build artifacts
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm ci --omit=dev --prefer-offline --no-audit --no-fund

# Build the application
echo "Building application..."
npm run build

echo "Build completed successfully!"
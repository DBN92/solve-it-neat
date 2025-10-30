#!/bin/bash

echo "🚀 Starting Nixpacks Build Simulation..."
echo "========================================"

# Set production environment
export NODE_ENV=production

echo "📦 Phase: Setup"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

echo "📥 Phase: Install"
echo "Installing dependencies (including dev dependencies for build)..."
npm ci --include=dev
if [ $? -ne 0 ]; then
    echo "❌ Install failed!"
    exit 1
fi
echo ""

echo "🔨 Phase: Build"
echo "Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo ""

echo "📊 Build Artifacts:"
ls -la dist/
echo ""

echo "✅ Nixpacks build simulation completed successfully!"
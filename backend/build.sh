#!/bin/bash
set -e

echo "==> Installing all dependencies (including devDependencies for build)..."
npm install

echo "==> Running Next.js build with NODE_ENV=production..."
NODE_ENV=production npm run build

if [ $? -eq 0 ]; then
  echo "==> ✓ Build completed successfully!"
else
  echo "==> ✗ Build failed!"
  exit 1
fi

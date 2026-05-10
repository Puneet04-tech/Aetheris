#!/bin/bash
# Backend startup script with increased heap memory for development

export NODE_OPTIONS="--max-old-space-size=4096"

echo "Starting backend with 4GB heap limit..."
npm run dev

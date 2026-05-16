#!/bin/bash
# Start script that respects PORT environment variable
PORT=${PORT:-3001}
NODE_ENV=production next start -p $PORT

#!/bin/bash

# AutoLink Backend Deployment Script
# This script deploys backend updates to the EC2 server

set -e

echo "🚀 Starting Backend Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/home/ec2-user/AutoLink/backend"

# Navigate to backend directory
cd $BACKEND_DIR

echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
cd ..
git pull origin main

# Backend deployment
echo -e "${YELLOW}🔧 Deploying Backend...${NC}"
cd $BACKEND_DIR

echo "Installing backend dependencies..."
npm install --production

echo "Restarting backend with PM2..."
npm run pm2:restart || npm run pm2:start

# Check PM2 status
echo -e "${YELLOW}📊 PM2 Status:${NC}"
pm2 status

# Show recent logs
echo -e "${YELLOW}📝 Recent Logs:${NC}"
pm2 logs autolink-backend --lines 10 --nostream

echo -e "${GREEN}✅ Backend deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}🌐 Backend API: http://ec2-54-87-6-215.compute-1.amazonaws.com/api${NC}"
echo -e "${GREEN}🏥 Health Check: http://ec2-54-87-6-215.compute-1.amazonaws.com/health${NC}"
echo ""
echo "📝 Useful commands:"
echo "  View logs: pm2 logs autolink-backend"
echo "  Stop backend: pm2 stop autolink-backend"
echo "  Restart backend: pm2 restart autolink-backend"


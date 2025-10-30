#!/bin/bash

# AutoLink Backend Deployment Script
# Run this from your LOCAL machine to deploy to EC2

set -e

echo "🚀 Starting Backend Deployment to EC2..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PEM file exists
if [ ! -f "AutoLink.pem" ]; then
    echo -e "${RED}❌ AutoLink.pem not found!${NC}"
    echo "Please run this script from the AutoLink directory"
    exit 1
fi

echo -e "${YELLOW}📤 Deploying to EC2...${NC}"
echo ""

# Copy .env file to EC2
if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}📋 Copying .env file to EC2...${NC}"
    scp -i "AutoLink.pem" backend/.env ec2-user@ec2-54-87-6-215.compute-1.amazonaws.com:/home/ec2-user/AutoLink/backend/.env
    echo -e "${GREEN}✓ .env file copied${NC}"
else
    echo -e "${RED}⚠️  Warning: backend/.env not found - skipping${NC}"
fi

echo ""

# SSH into EC2 and run deployment commands
ssh -i "AutoLink.pem" ec2-user@ec2-54-87-6-215.compute-1.amazonaws.com << 'ENDSSH'

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🚀 Backend Deployment on EC2                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Navigate to project directory
cd /home/ec2-user/AutoLink

echo "📥 Pulling latest changes from git..."
git pull origin main

# Backend deployment
echo ""
echo "🔧 Deploying Backend..."
cd backend

echo "Installing backend dependencies..."
npm install --production

echo ""
echo "Restarting backend with PM2..."
# Stop the backend first to ensure clean restart
pm2 stop autolink-backend 2>/dev/null || true

# Start/Restart backend
npm run pm2:start 2>/dev/null || npm run pm2:restart

echo ""
echo "Waiting for backend to start..."
sleep 3

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Recent Logs (checking startup):"
pm2 logs autolink-backend --lines 15 --nostream

echo ""
echo "🔍 Testing backend health..."
curl -s https://api.linkedora.com/health | head -3 || echo "Backend starting..."

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ Backend Deployment Complete!                       ║"
echo "╚══════════════════════════════════════════════════════════╝"

ENDSSH

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}🌐 Backend API: https://api.linkedora.com/api${NC}"
echo -e "${GREEN}🏥 Health Check: https://api.linkedora.com/health${NC}"
echo ""
echo "📝 Useful commands:"
echo "  View logs: ssh -i AutoLink.pem ec2-user@ec2-54-87-6-215.compute-1.amazonaws.com 'pm2 logs autolink-backend'"
echo "  Check status: ssh -i AutoLink.pem ec2-user@ec2-54-87-6-215.compute-1.amazonaws.com 'pm2 status'"
echo ""

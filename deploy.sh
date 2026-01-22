#!/bin/bash
# Deployment script for Hostinger

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to Hostinger...${NC}"

# Build the project
echo -e "${YELLOW}Building Next.js application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Build completed successfully!${NC}"

# SSH connection details
SSH_USER="u719848077"
SSH_HOST="82.198.227.167"
SSH_PORT="65002"
REMOTE_PATH="/home/u719848077/domains/irmalogistics.com/public_html/crm"

# Create deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
tar -czf deploy.tar.gz \
    .next/standalone \
    .next/static \
    public \
    package.json \
    package-lock.json \
    next.config.js \
    --exclude=node_modules \
    --exclude=.git

echo -e "${GREEN}Package created!${NC}"

# Upload to server
echo -e "${YELLOW}Uploading files to server...${NC}"
scp -P $SSH_PORT deploy.tar.gz $SSH_USER@$SSH_HOST:$REMOTE_PATH/

if [ $? -ne 0 ]; then
    echo -e "${RED}Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Files uploaded successfully!${NC}"

# SSH and deploy
echo -e "${YELLOW}Deploying on server...${NC}"
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'ENDSSH'
cd /home/u719848077/domains/irmalogistics.com/public_html/crm
tar -xzf deploy.tar.gz
rm deploy.tar.gz
npm install --production
pm2 restart crm || pm2 start npm --name "crm" -- start
ENDSSH

echo -e "${GREEN}Deployment completed!${NC}"

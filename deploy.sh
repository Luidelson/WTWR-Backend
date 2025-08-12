#!/bin/bash

# WTWR Express Backend Deployment Script
# Run this script on your Ubuntu server

echo "🚀 Starting WTWR Express Backend Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS version)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
echo "📦 Installing MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
echo "🔧 Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/wtwr-backend
sudo chown -R $USER:$USER /var/www/wtwr-backend

echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Upload your project files to /var/www/wtwr-backend"
echo "2. Run 'npm install' in the project directory"
echo "3. Configure environment variables"
echo "4. Start the application with PM2"
echo ""
echo "Example commands:"
echo "cd /var/www/wtwr-backend"
echo "npm install"
echo "cp .env.production .env"
echo "pm2 start app.js --name wtwr-backend"
echo "pm2 startup"
echo "pm2 save"

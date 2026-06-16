#!/bin/bash

# InternX VPS Deployment Script
echo "🚀 Starting InternX deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Install MongoDB (if not using cloud)
read -p "Do you want to install MongoDB locally? (y/n): " install_mongo
if [ "$install_mongo" = "y" ]; then
    print_status "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt update
    apt install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi

# Create application directory
print_status "Setting up application directory..."
mkdir -p /var/www/internx
mkdir -p /var/www/internx/logs

# Set up firewall
print_status "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80
ufw allow 443
ufw --force enable

print_status "✅ Server setup completed!"
print_warning "Next steps:"
echo "1. Upload your project files to /var/www/internx/"
echo "2. Configure your .env file"
echo "3. Run the application deployment commands"
echo "4. Configure your domain in Nginx"
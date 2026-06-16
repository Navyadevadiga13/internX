# InternX VPS Deployment Guide

## Prerequisites
- Ubuntu 20.04+ VPS from Hostinger
- Root access to the server
- Domain name pointed to your VPS IP

## Step 1: Initial Server Setup

1. **Connect to your VPS:**
```bash
ssh root@your-server-ip
```

2. **Run the deployment script:**
```bash
# Upload deploy.sh to your server and run:
chmod +x deploy.sh
sudo ./deploy.sh
```

## Step 2: Upload Project Files

1. **Upload project to server:**
```bash
# From your local machine:
scp -r . root@your-server-ip:/var/www/internx/
```

Or use FileZilla/WinSCP to upload files to `/var/www/internx/`

## Step 3: Configure Environment

1. **Set up environment variables:**
```bash
cd /var/www/internx
cp backend/.env.example backend/.env
nano backend/.env
```

Update the `.env` file with your actual values:
- Replace `your-domain.com` with your actual domain
- Ensure MongoDB URI is correct
- Verify email credentials

## Step 4: Install Dependencies and Build

```bash
cd /var/www/internx

# Install all dependencies
npm run install-all

# Build frontend
npm run build

# Install production dependencies for backend
cd backend && npm install --production
```

## Step 5: Configure Nginx

1. **Create Nginx configuration:**
```bash
cp nginx.conf /etc/nginx/sites-available/internx
ln -s /etc/nginx/sites-available/internx /etc/nginx/sites-enabled/
```

2. **Update domain in Nginx config:**
```bash
nano /etc/nginx/sites-available/internx
# Replace 'your-domain.com' with your actual domain
```

3. **Test and restart Nginx:**
```bash
nginx -t
systemctl restart nginx
```

## Step 6: Start the Application

```bash
cd /var/www/internx

# Start with PM2
npm run deploy:start

# Check if running
pm2 status
```

## Step 7: Set up SSL (Optional but Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Management Commands

```bash
# View logs
npm run deploy:logs

# Restart application
npm run deploy:restart

# Stop application
npm run deploy:stop

# Check PM2 status
pm2 status

# Monitor resources
pm2 monit
```

## Troubleshooting

### Check Application Status
```bash
pm2 status
pm2 logs internx-backend
```

### Check Nginx Status
```bash
systemctl status nginx
nginx -t
```

### Check MongoDB (if local)
```bash
systemctl status mongod
```

### View Application Logs
```bash
tail -f /var/www/internx/logs/combined.log
```

### Restart Services
```bash
# Restart application
pm2 restart internx-backend

# Restart Nginx
systemctl restart nginx

# Restart MongoDB (if local)
systemctl restart mongod
```

## File Permissions
```bash
# Set correct permissions
chown -R www-data:www-data /var/www/internx
chmod -R 755 /var/www/internx
```

## Backup Strategy
```bash
# Create backup script
cat > /root/backup-internx.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /root/internx-backup-$DATE.tar.gz /var/www/internx
mongodump --uri="your-mongodb-uri" --out /root/db-backup-$DATE
EOF

chmod +x /root/backup-internx.sh

# Add to crontab for daily backups
echo "0 2 * * * /root/backup-internx.sh" | crontab -
```

## Security Recommendations

1. **Change default SSH port**
2. **Set up fail2ban**
3. **Regular security updates**
4. **Use strong passwords**
5. **Enable firewall (UFW)**

## Support

If you encounter issues:
1. Check the logs: `pm2 logs internx-backend`
2. Verify Nginx configuration: `nginx -t`
3. Check MongoDB connection
4. Ensure all environment variables are set correctly

Your InternX application should now be running at: https://your-domain.com
# AWS EC2 Deployment Guide for MAYA Backend

Follow these steps to deploy your Node.js backend on an AWS EC2 instance.

## 1. Launch a Linux Instance
- **OS**: Ubuntu 22.04 LTS (Recommended)
- **Security Group**:
  - `SSH` (Port 22): Your IP
  - `HTTP` (Port 80): Anywhere
  - `HTTPS` (Port 443): Anywhere
  - `Custom TCP` (Port 3000): If you want to access the API directly (not recommended, use Nginx)

## 2. Server Setup
Connect via SSH and run:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

## 3. Project Deployment
```bash
# Clone your repository
git clone <your-repo-url>
cd Dating-App-Backend

# Install dependencies
npm install --production

# Set up environment variables
cp .env.example .env
nano .env  # Fill in your production values (Mongo URI, Secrets, etc.)

# Place your Firebase service account file
# Make sure FIREBASE_SERVICE_ACCOUNT_PATH in .env points to its location
```

## 4. Run the Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Enable PM2 to start on boot
pm2 startup
# (Run the command outputted by the previous step)
pm2 save
```

## 5. Nginx Reverse Proxy (Recommended)
```bash
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/maya-backend
```
Paste this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com; # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/maya-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. SSL with Certbot (Free)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 7. Useful PM2 Commands
- `pm2 status`: Show running processes
- `pm2 logs`: View real-time logs
- `pm2 restart all`: Restart the app
- `pm2 stop all`: Stop the app

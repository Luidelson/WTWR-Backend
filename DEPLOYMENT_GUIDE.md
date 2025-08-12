# WTWR Express Backend - Ubuntu Deployment Guide

## 🚀 Deployment Instructions

### Step 1: Prepare Your Ubuntu Server

1. **Upload the deployment script to your Ubuntu server:**
   ```bash
   # On your local machine, copy the deploy.sh to your server
   scp deploy.sh username@your-server-ip:/home/username/
   ```

2. **Run the deployment script on Ubuntu:**
   ```bash
   ssh username@your-server-ip
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Step 2: Upload Your Project Files

1. **Upload your project to the server:**
   ```bash
   # From your local machine
   scp -r se_project_express/ username@your-server-ip:/var/www/wtwr-backend/
   ```

   Or use Git (recommended):
   ```bash
   # On the Ubuntu server
   cd /var/www/wtwr-backend
   git clone https://github.com/Luidelson/se_project_express.git .
   ```

### Step 3: Install Dependencies and Configure

1. **Install Node.js dependencies:**
   ```bash
   cd /var/www/wtwr-backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.production .env
   # Edit the .env file with your actual values
   nano .env
   ```

3. **Create logs directory:**
   ```bash
   mkdir logs
   ```

### Step 4: Start the Application

1. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.json
   ```

2. **Set up PM2 to start on boot:**
   ```bash
   pm2 startup
   pm2 save
   ```

### Step 5: Configure Firewall (Optional but Recommended)

```bash
# Allow SSH
sudo ufw allow ssh

# Allow your application port
sudo ufw allow 3001

# Enable firewall
sudo ufw enable
```

### Step 6: Set up Nginx as Reverse Proxy (Optional)

1. **Install Nginx:**
   ```bash
   sudo apt install nginx
   ```

2. **Create Nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/wtwr-backend
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/wtwr-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 📋 Useful Commands

### PM2 Management
```bash
pm2 list              # List all processes
pm2 logs wtwr-backend # View logs
pm2 restart wtwr-backend # Restart the app
pm2 stop wtwr-backend    # Stop the app
pm2 delete wtwr-backend  # Delete the process
```

### MongoDB Management
```bash
sudo systemctl status mongod   # Check MongoDB status
sudo systemctl start mongod    # Start MongoDB
sudo systemctl stop mongod     # Stop MongoDB
mongo                          # Connect to MongoDB shell
```

### Application Logs
```bash
# PM2 logs
pm2 logs wtwr-backend

# Application-specific logs
tail -f /var/www/wtwr-backend/logs/combined.log
tail -f /var/www/wtwr-backend/logs/err.log
```

## 🔧 Troubleshooting

### Common Issues:

1. **Port already in use:**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

2. **MongoDB connection issues:**
   ```bash
   sudo systemctl status mongod
   sudo journalctl -u mongod
   ```

3. **Permission issues:**
   ```bash
   sudo chown -R $USER:$USER /var/www/wtwr-backend
   ```

4. **Check if app is running:**
   ```bash
   curl http://localhost:3001/items
   ```

## 🌐 Updating Your Frontend

Don't forget to update your React frontend's API base URL to point to your deployed backend:

```javascript
// In your React app's API configuration
const BASE_URL = 'http://your-server-ip:3001'; // or your domain
```

## 🔐 Security Considerations

1. **Use strong JWT secrets**
2. **Enable HTTPS with SSL certificates**
3. **Keep your system updated**
4. **Use environment variables for sensitive data**
5. **Configure proper CORS origins**

Your WTWR backend should now be deployed and running on Ubuntu! 🎉

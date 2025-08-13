# Smart Attend - Deployment Guide

## 🚀 Production Deployment Guide

### Prerequisites

#### System Requirements
- **Server**: Ubuntu 20.04 LTS or newer
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 50GB SSD (100GB+ recommended)
- **CPU**: 2+ cores
- **Network**: Static IP address

#### Software Requirements
- **Node.js**: v18.0+ (LTS recommended)
- **MySQL**: v8.0+
- **Nginx**: Latest stable
- **SSL Certificate**: Let's Encrypt or commercial
- **PM2**: Process manager for Node.js

---

## 📋 Pre-deployment Checklist

- [ ] Server provisioned and accessible
- [ ] Domain name configured
- [ ] SSL certificate ready
- [ ] Database server installed
- [ ] Backup strategy planned
- [ ] Monitoring tools ready

---

## 🔧 Server Setup

### 1. System Updates
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2. Install Node.js
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install MySQL
```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
-- In MySQL console
CREATE DATABASE absensi_smkn13;
CREATE USER 'absensi_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON absensi_smkn13.* TO 'absensi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Install PM2
```bash
sudo npm install -g pm2
```

---

## 📦 Application Deployment

### 1. Clone and Setup Application
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/RaiKanaeru/absensi-13.git
sudo chown -R $USER:$USER /var/www/absensi-13
cd absensi-13

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup
```bash
# Import database schema
mysql -u absensi_user -p absensi_smkn13 < database.md
```

### 3. Environment Configuration

#### Backend Environment
```bash
# Create backend .env file
cd backend
cp .env.example .env
nano .env
```

```env
# Production Backend Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=absensi_smkn13
DB_USER=absensi_user
DB_PASSWORD=your_secure_database_password

JWT_SECRET=your_super_secure_jwt_secret_key_64_chars_minimum
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

BCRYPT_ROUNDS=12
SESSION_TIMEOUT=1800000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend Environment
```bash
# Create frontend .env.local file
cd ..
cp .env.example .env.local
nano .env.local
```

```env
# Production Frontend Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_NAME="Smart Attend"

# Optional: Firebase/Genkit config
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_API_KEY=your_google_api_key
```

### 4. Build Application
```bash
# Build frontend
npm run build

# Test build
npm start &  # Test server
curl http://localhost:3000
kill %1  # Stop test server
```

---

## 🌐 Nginx Configuration

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/smartattend
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=2r/m;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Login rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://127.0.0.1:5000/api/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/smartattend_access.log;
    error_log /var/log/nginx/smartattend_error.log;
}
```

### 2. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/smartattend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 SSL Certificate (Let's Encrypt)

### 1. Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🚀 Process Management with PM2

### 1. Create PM2 Ecosystem File
```bash
nano /var/www/absensi-13/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'smartattend-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/absensi-13',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'smartattend-backend',
      script: 'server.js',
      cwd: '/var/www/absensi-13/backend',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
```

### 2. Start Applications
```bash
cd /var/www/absensi-13
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Monitor Applications
```bash
pm2 status
pm2 logs
pm2 monit
```

---

## 📊 Monitoring & Logging

### 1. Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/smartattend
```

```
/var/log/nginx/smartattend_*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}

/var/www/absensi-13/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nobody nogroup
    postrotate
        pm2 reload smartattend-backend
    endscript
}
```

### 2. System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup system monitoring cron jobs
sudo crontab -e
```

```bash
# System health check every 5 minutes
*/5 * * * * /usr/bin/systemctl is-active --quiet nginx || /usr/bin/systemctl restart nginx
*/5 * * * * /usr/bin/systemctl is-active --quiet mysql || /usr/bin/systemctl restart mysql

# Disk space monitoring
0 */6 * * * df -h | grep -E '9[0-9]%|100%' && echo "High disk usage detected" | mail -s "Disk Space Alert" admin@yourdomain.com

# Daily backup
0 2 * * * /var/www/absensi-13/scripts/backup.sh
```

---

## 💾 Backup Strategy

### 1. Create Backup Script
```bash
mkdir -p /var/www/absensi-13/scripts
nano /var/www/absensi-13/scripts/backup.sh
```

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/smartattend"
DB_NAME="absensi_smkn13"
DB_USER="absensi_user"
DB_PASS="your_database_password"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/database_$TIMESTAMP.sql.gz

# Application files backup
tar -czf $BACKUP_DIR/application_$TIMESTAMP.tar.gz -C /var/www absensi-13 --exclude=node_modules --exclude=.next --exclude=logs

# Remove old backups
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

# Log backup completion
echo "$(date): Backup completed successfully" >> /var/log/smartattend-backup.log
```

```bash
chmod +x /var/www/absensi-13/scripts/backup.sh
```

### 2. Setup Offsite Backup (Optional)
```bash
# Install rclone for cloud storage
curl https://rclone.org/install.sh | sudo bash

# Configure cloud storage
rclone config

# Add to backup script
rclone sync $BACKUP_DIR remote:smartattend-backups
```

---

## 🔍 Health Checks & Monitoring

### 1. Create Health Check Script
```bash
nano /var/www/absensi-13/scripts/healthcheck.sh
```

```bash
#!/bin/bash

# Check if services are running
check_service() {
    if systemctl is-active --quiet $1; then
        echo "✅ $1 is running"
    else
        echo "❌ $1 is not running"
        systemctl restart $1
    fi
}

# Check if ports are accessible
check_port() {
    if nc -z localhost $1; then
        echo "✅ Port $1 is accessible"
    else
        echo "❌ Port $1 is not accessible"
    fi
}

echo "=== Health Check $(date) ==="

# Check system services
check_service nginx
check_service mysql

# Check application ports
check_port 3000
check_port 5000

# Check PM2 processes
pm2 jlist | jq -r '.[] | select(.pm2_env.status != "online") | .name' | while read app; do
    echo "❌ $app is not online"
    pm2 restart $app
done

# Check database connectivity
mysql -u $DB_USER -p$DB_PASS -e "SELECT 1" $DB_NAME > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database is accessible"
else
    echo "❌ Database is not accessible"
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "⚠️  High disk usage: ${DISK_USAGE}%"
else
    echo "✅ Disk usage: ${DISK_USAGE}%"
fi

echo "=== Health Check Complete ==="
```

```bash
chmod +x /var/www/absensi-13/scripts/healthcheck.sh
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
pm2 logs
tail -f /var/log/nginx/smartattend_error.log

# Check process status
pm2 status
systemctl status nginx mysql

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

#### 2. Database Connection Issues
```bash
# Test database connection
mysql -u absensi_user -p absensi_smkn13 -e "SELECT 1;"

# Check MySQL status
sudo systemctl status mysql
sudo tail -f /var/log/mysql/error.log

# Restart MySQL
sudo systemctl restart mysql
```

#### 3. SSL Certificate Issues
```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Test nginx configuration
sudo nginx -t
```

#### 4. High Memory Usage
```bash
# Check memory usage
htop
free -h
pm2 monit

# Restart applications
pm2 restart all --update-env
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Optimize database
OPTIMIZE TABLE attendance_sessions;
OPTIMIZE TABLE student_attendances;
ANALYZE TABLE attendance_sessions;
ANALYZE TABLE student_attendances;

-- Check slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

#### 2. Application Optimization
```bash
# Enable gzip compression in nginx
# Add to server block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer (HAProxy/Nginx)
- Multiple application instances
- Database clustering
- Redis for session management

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching layers
- CDN for static assets

### Monitoring & Alerting
- Application Performance Monitoring (APM)
- Server monitoring (Prometheus + Grafana)
- Log aggregation (ELK Stack)
- Uptime monitoring

---

## 📞 Support

For deployment support, contact:
- **Email**: devops@smartattend.smkn13.sch.id
- **Documentation**: See [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)
- **Issues**: GitHub Issues

---

*© 2024 SMKN 13 Bandung. Smart Attend Deployment Guide.*
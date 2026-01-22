# Hostinger Deployment Guide

## Ön Gereksinimler

1. **Node.js ve PM2 kurulumu** (sunucuda)
2. **.env.production** dosyası oluşturulmalı

## Adım 1: Sunucuda Node.js Kurulumu

SSH ile bağlanın:
```bash
ssh -p 65002 u719848077@82.198.227.167
```

Node.js kurulumu (eğer yoksa):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

PM2 kurulumu:
```bash
npm install -g pm2
```

## Adım 2: .env.production Dosyası

Sunucuda `.env.production` dosyası oluşturun:
```bash
cd /home/u719848077/domains/irmalogistics.com/public_html/crm
nano .env.production
```

İçeriği:
```
NEXT_PUBLIC_SUPABASE_URL=https://a4c25270-bb57-4bcc-bc65-7605e1c573ca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=production
```

## Adım 3: Dosyaları Yükleme

### Yöntem 1: Git ile (Önerilen)
```bash
# Lokal makinede
git init
git add .
git commit -m "Initial commit"
git remote add hostinger ssh://u719848077@82.198.227.167:65002/home/u719848077/domains/irmalogistics.com/public_html/crm.git
git push hostinger main
```

### Yöntem 2: SCP ile
```bash
# Lokal makinede
scp -P 65002 -r .next u719848077@82.198.227.167:/home/u719848077/domains/irmalogistics.com/public_html/crm/
scp -P 65002 package.json package-lock.json next.config.js u719848077@82.198.227.167:/home/u719848077/domains/irmalogistics.com/public_html/crm/
```

## Adım 4: Sunucuda Kurulum

SSH ile bağlanın ve şunları çalıştırın:
```bash
cd /home/u719848077/domains/irmalogistics.com/public_html/crm
npm install --production
```

## Adım 5: PM2 ile Başlatma

```bash
cd /home/u719848077/domains/irmalogistics.com/public_html/crm
pm2 start npm --name "crm" -- start
pm2 save
pm2 startup
```

## Adım 6: Nginx/Apache Yapılandırması

Hostinger panelinden domain yapılandırması yapın veya `.htaccess` dosyası oluşturun:

### .htaccess (Apache için)
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### Nginx (eğer varsa)
```nginx
server {
    listen 80;
    server_name crm.irmalogistics.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Notlar

- Port 3000 kullanılıyor, gerekirse değiştirin
- PM2 logları: `pm2 logs crm`
- PM2 durdurma: `pm2 stop crm`
- PM2 yeniden başlatma: `pm2 restart crm`

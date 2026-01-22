# Hostinger Deployment - Hızlı Başlangıç

## Önemli Not
Build sırasında TypeScript hataları var. Önce bunları düzeltmeniz gerekiyor.

## Manuel Deployment Adımları

### 1. Build Alın (Lokal)
```bash
npm run build
```

### 2. Dosyaları Yükleyin

**Seçenek A: FTP ile (FileZilla, WinSCP)**
- Host: 82.198.227.167
- Port: 21 (FTP) veya 65002 (SFTP)
- Kullanıcı: u719848077
- Şifre: SDFSDF.asd5
- Hedef: /home/u719848077/domains/irmalogistics.com/public_html/crm

**Yüklenecek Dosyalar:**
- `.next` klasörü (tüm içeriği)
- `package.json`
- `package-lock.json`
- `next.config.js`
- `public` klasörü (varsa)

### 3. SSH ile Bağlanın
```bash
ssh -p 65002 u719848077@82.198.227.167
```

### 4. Sunucuda Kurulum
```bash
cd /home/u719848077/domains/irmalogistics.com/public_html/crm

# Node.js kontrolü
node --version

# Eğer Node.js yoksa, Hostinger panelinden Node.js versiyonu seçin
# veya NVM ile kurun:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Bağımlılıkları yükleyin
npm install --production

# .env.production oluşturun
nano .env.production
```

`.env.production` içeriği:
```
NEXT_PUBLIC_SUPABASE_URL=https://a4c25270-bb57-4bcc-bc65-7605e1c573ca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=production
PORT=3000
```

### 5. PM2 ile Başlatın
```bash
# PM2 kurulumu (eğer yoksa)
npm install -g pm2

# Uygulamayı başlat
cd /home/u719848077/domains/irmalogistics.com/public_html/crm
pm2 start npm --name "crm" -- start
pm2 save
pm2 startup
```

### 6. Domain Yapılandırması

Hostinger panelinde:
1. Domain yönetimi → crm.irmalogistics.com
2. Reverse Proxy ayarları yapın veya `.htaccess` ekleyin

**`.htaccess` (public_html/crm klasöründe):**
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## Sorun Giderme

- **PM2 logları:** `pm2 logs crm`
- **PM2 durdurma:** `pm2 stop crm`
- **PM2 yeniden başlatma:** `pm2 restart crm`
- **Port kontrolü:** `netstat -tulpn | grep 3000`

## Notlar

- Hostinger shared hosting'de Node.js desteği sınırlı olabilir
- VPS veya Cloud hosting önerilir
- Alternatif: Vercel, Netlify gibi platformlar kullanılabilir

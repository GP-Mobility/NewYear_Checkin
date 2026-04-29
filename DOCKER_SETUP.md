# 🐳 Docker Setup Guide

คู่มือการติดตั้งและใช้งานโปรเจคด้วย Docker และ Docker Compose

## 📋 ความต้องการเบื้องต้น

- Docker Engine 20.10+
- Docker Compose 2.0+
- MySQL Database (สามารถใช้ external database หรือเพิ่มใน docker-compose)

## 🚀 การติดตั้ง

### 1. สร้างไฟล์ Environment

```bash
cp .env.docker.example .env
```

แก้ไข `.env` ตามการตั้งค่าของคุณ:

```env
DB_HOST=192.168.40.15
DB_USER=root
DB_PASSWORD=gp25095
DB_NAME=NYCheckin
DB_PORT=3800
QR_SECRET=your-secret-key-change-this
```

### 2. สร้าง SSL Certificates (สำหรับ Production)

#### วิธีที่ 1: ใช้ Self-Signed Certificate (สำหรับ Development/Testing)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Company/CN=yourdomain.com"
```

#### วิธีที่ 2: ใช้ Let's Encrypt (สำหรับ Production)

1. แก้ไข `nginx/conf.d/default.conf` เพื่อใช้ Let's Encrypt
2. ใช้ certbot เพื่อสร้าง certificates
3. Mount certificates ไปที่ `nginx/ssl/`

### 3. ตั้งค่า Nginx

#### สำหรับ Development (HTTP only)

```bash
# ใช้ไฟล์ http-only.conf แทน default.conf
cp nginx/conf.d/http-only.conf nginx/conf.d/default.conf
```

#### สำหรับ Production (HTTPS)

ใช้ไฟล์ `nginx/conf.d/default.conf` ที่มีอยู่แล้ว (ต้องมี SSL certificates)

### 4. Build และ Run

#### สำหรับ Direct Port Access (Port 4101) - แนะนำ

```bash
# Build images
docker-compose -f docker-compose.simple.yml build

# Start services
docker-compose -f docker-compose.simple.yml up -d

# View logs
docker-compose -f docker-compose.simple.yml logs -f

# Stop services
docker-compose -f docker-compose.simple.yml down
```

#### สำหรับ Production with Nginx (HTTPS)

```bash
# Build images
docker-compose build

# Start services (uncomment nginx service in docker-compose.yml first)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 การเข้าถึง

### Direct Port Access (Recommended for port 4101)
- **URL:** `http://192.168.40.15:4101` หรือ `http://yourdomain.com:4101`
- **Port:** 4101
- **Usage:** `docker-compose -f docker-compose.simple.yml up -d`

### With Nginx Reverse Proxy
- **URL:** `http://localhost` หรือ `http://your-server-ip` (port 80)
- **HTTPS:** `https://yourdomain.com` (port 443)
- **Usage:** `docker-compose up -d` (uncomment nginx service)

## 🔧 การตั้งค่า DNS

### 1. ตั้งค่า DNS Record

เพิ่ม A record ใน DNS provider ของคุณ:

```
Type: A
Name: @ (หรือ subdomain เช่น checkin)
Value: YOUR_SERVER_IP
TTL: 3600
```

### 2. ตรวจสอบ DNS

```bash
# ตรวจสอบ DNS resolution
nslookup yourdomain.com
dig yourdomain.com
```

### 3. อัปเดต Nginx Configuration

แก้ไข `nginx/conf.d/default.conf`:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

## 📝 คำสั่งที่มีประโยชน์

```bash
# ดู logs
docker-compose logs -f app
docker-compose logs -f nginx

# Restart services
docker-compose restart

# Rebuild และ restart
docker-compose up -d --build

# ดู status
docker-compose ps

# เข้าไปใน container
docker-compose exec app sh
docker-compose exec nginx sh

# Clean up (ลบ containers, networks, volumes)
docker-compose down -v
```

## 🔒 Security Best Practices

1. **เปลี่ยน QR_SECRET** เป็น random string ที่ปลอดภัย
2. **ใช้ HTTPS** ใน production
3. **ตั้งค่า Firewall** ให้เปิดเฉพาะ port 80 และ 443
4. **อัปเดต Docker images** เป็นประจำ
5. **ใช้ Environment Variables** สำหรับ sensitive data

## 🐛 Troubleshooting

### Container ไม่ start

```bash
# ตรวจสอบ logs
docker-compose logs app

# ตรวจสอบ health check
docker-compose ps
```

### Database Connection Error

- ตรวจสอบว่า MySQL database เปิดอยู่และ accessible
- ตรวจสอบ environment variables ใน `.env`
- ตรวจสอบ network connectivity จาก container ไปยัง database

### Nginx 502 Bad Gateway

- ตรวจสอบว่า app container ทำงานอยู่: `docker-compose ps`
- ตรวจสอบ app logs: `docker-compose logs app`
- ตรวจสอบว่า app listen ที่ port 3000

### SSL Certificate Error

- ตรวจสอบว่า certificates อยู่ใน `nginx/ssl/`
- ตรวจสอบ permissions ของไฟล์ certificates
- สำหรับ self-signed certificates เบราว์เซอร์จะแสดง warning (ปกติ)

## 📚 ข้อมูลเพิ่มเติม

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)


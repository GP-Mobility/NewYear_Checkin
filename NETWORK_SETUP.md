# Network Configuration Guide

## การเข้าถึงผ่าน IP Address

โปรเจกต์นี้ถูกตั้งค่าให้สามารถเข้าถึงได้ผ่าน IP Address จากอุปกรณ์อื่นในเครือข่ายเดียวกัน

## IP Address ของเครื่อง

รันคำสั่งเพื่อดู IP Address:
```bash
npm run ip
```

หรือ
```bash
node scripts/get-ip.js
```

## การรัน Server

### Development Mode
```bash
npm run dev
```

คำสั่งนี้จะ:
- แสดง IP Address และ URL สำหรับเข้าถึง
- เริ่ม Next.js dev server ที่พอร์ต 4101
- ฟังที่ `0.0.0.0` (ทุก network interface)

### Production Mode
```bash
npm run build
npm start
```

## URL สำหรับเข้าถึง

เมื่อรัน server แล้ว สามารถเข้าถึงได้ที่:

- **Local (จากเครื่องเดียวกัน):** `http://localhost:4101`
- **Network (จากอุปกรณ์อื่น):** `http://<IP_ADDRESS>:4101`

ตัวอย่าง: `http://192.168.40.15:4101`

## การเข้าถึงจากอุปกรณ์อื่น

1. ตรวจสอบว่าเครื่องและอุปกรณ์อื่นอยู่ในเครือข่ายเดียวกัน (WiFi/LAN เดียวกัน)
2. ใช้ IP Address ที่แสดงเมื่อรัน `npm run dev`
3. เปิดเบราว์เซอร์บนอุปกรณ์อื่นและเข้าไปที่ `http://<IP>:4101`

## Firewall Settings

หากไม่สามารถเข้าถึงได้จากอุปกรณ์อื่น ให้ตรวจสอบ Firewall:

### วิธีที่ 1: ใช้ Script (แนะนำ)
```bash
npm run setup:firewall
```

### วิธีที่ 2: ตั้งค่าด้วยตนเอง

#### Ubuntu/Debian (UFW)
```bash
sudo ufw allow 4101/tcp
sudo ufw reload
sudo ufw status
```

**สำคัญ:** ต้อง reload UFW หลังจาก allow port

#### CentOS/RHEL (firewalld)
```bash
sudo firewall-cmd --permanent --add-port=4101/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

#### iptables (ถ้าใช้)
```bash
sudo iptables -A INPUT -p tcp --dport 4101 -j ACCEPT
sudo iptables-save
```

### ตรวจสอบ Firewall
```bash
npm run check:network
```

## Troubleshooting

### ไม่สามารถเข้าถึงจากอุปกรณ์อื่น

**ตรวจสอบด้วย Script:**
```bash
npm run check:network
```

**ตรวจสอบด้วยตนเอง:**

1. **ตรวจสอบว่า server ฟังที่ `0.0.0.0`**
   ```bash
   netstat -tuln | grep 4101
   # ควรเห็น: 0.0.0.0:4101 (ไม่ใช่ 127.0.0.1:4101)
   ```

2. **ตรวจสอบ Firewall**
   ```bash
   sudo ufw status | grep 4101
   # ถ้าไม่เห็น ให้รัน: npm run setup:firewall
   ```

3. **ตรวจสอบ IP Address**
   ```bash
   npm run ip
   # หรือ
   hostname -I
   ```

4. **ตรวจสอบว่าเครื่องและอุปกรณ์อื่นอยู่ในเครือข่ายเดียวกัน**
   - ต้องเชื่อมต่อ WiFi/LAN เดียวกัน
   - IP address ต้องอยู่ใน subnet เดียวกัน

5. **ทดสอบการเชื่อมต่อ**
   ```bash
   # จากเครื่องเดียวกัน
   curl http://localhost:4101
   
   # จากอุปกรณ์อื่น (ทดสอบด้วย telnet)
   telnet <IP_ADDRESS> 4101
   ```

📖 ดูรายละเอียดเพิ่มเติมที่ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### เปลี่ยนพอร์ต
แก้ไขใน `package.json`:
```json
"dev": "next dev -p <PORT> --hostname 0.0.0.0"
```

## Scripts ที่มีให้

- `npm run dev` - รัน dev server พร้อมแสดง IP
- `npm run dev:ip` - รัน dev server แบบ alternative
- `npm run ip` - แสดง IP Address เท่านั้น
- `npm start` - รัน production server พร้อมแสดง IP


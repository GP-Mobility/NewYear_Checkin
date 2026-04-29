# 🔧 คู่มือแก้ไขปัญหาเครือข่าย

## ปัญหาที่พบบ่อย

### ❌ ไม่สามารถเข้าถึงจากอุปกรณ์อื่นได้

#### 1. ตรวจสอบว่า Server กำลังรันอยู่

```bash
# ตรวจสอบว่า port 4101 กำลังฟังอยู่
npm run check:network

# หรือตรวจสอบด้วยคำสั่ง
netstat -tuln | grep 4101
# หรือ
ss -tuln | grep 4101
```

ควรเห็น: `0.0.0.0:4101` (ไม่ใช่ `127.0.0.1:4101`)

#### 2. ตรวจสอบ Firewall

```bash
# ตรวจสอบสถานะ UFW
sudo ufw status

# ตรวจสอบว่า port 4101 เปิดอยู่
sudo ufw status | grep 4101
```

**ถ้ายังไม่เปิด ให้รัน:**
```bash
npm run setup:firewall
```

หรือรันด้วยตนเอง:
```bash
sudo ufw allow 4101/tcp
sudo ufw reload
sudo ufw status
```

#### 3. ตรวจสอบ iptables (ถ้ามี)

บางระบบอาจใช้ iptables แทน UFW:

```bash
# ตรวจสอบ iptables rules
sudo iptables -L -n | grep 4101

# เปิด port ใน iptables
sudo iptables -A INPUT -p tcp --dport 4101 -j ACCEPT
sudo iptables-save
```

#### 4. ตรวจสอบ SELinux (ถ้าใช้)

```bash
# ตรวจสอบ SELinux status
getenforce

# ถ้าเป็น Enforcing อาจต้องตั้งค่า
sudo setsebool -P httpd_can_network_connect 1
```

#### 5. ตรวจสอบ Network Interface

```bash
# ดู IP address ที่ถูกต้อง
ip addr show | grep "inet " | grep -v "127.0.0.1"

# หรือ
hostname -I
```

ใช้ IP address ที่แสดง (ไม่ใช่ 127.0.0.1 หรือ localhost)

#### 6. ทดสอบการเชื่อมต่อ

**จากเครื่องเดียวกัน:**
```bash
curl http://localhost:4101
```

**จากอุปกรณ์อื่น (ทดสอบด้วย telnet หรือ nc):**
```bash
# บนอุปกรณ์อื่น
telnet <IP_ADDRESS> 4101
# หรือ
nc -zv <IP_ADDRESS> 4101
```

#### 7. ตรวจสอบว่า Next.js ฟังที่ 0.0.0.0

ตรวจสอบใน `package.json` ว่ามี `--hostname 0.0.0.0`:

```json
"dev": "next dev -p 4101 --hostname 0.0.0.0"
```

**สำคัญ:** ต้องใช้ `0.0.0.0` ไม่ใช่ `localhost` หรือ `127.0.0.1`

## 🔍 Scripts ที่มีให้

### ตรวจสอบเครือข่าย
```bash
npm run check:network
```
จะแสดง:
- IP Address
- Port status
- Firewall status
- Connection test

### ตั้งค่า Firewall
```bash
npm run setup:firewall
```
จะเปิด port 4101 ใน firewall อัตโนมัติ

### แสดง IP Address
```bash
npm run ip
```

## 📋 Checklist แก้ไขปัญหา

- [ ] Server กำลังรัน (`npm run dev`)
- [ ] Port 4101 ฟังที่ `0.0.0.0` (ไม่ใช่ `127.0.0.1`)
- [ ] Firewall เปิด port 4101 (`sudo ufw allow 4101/tcp`)
- [ ] Firewall reload แล้ว (`sudo ufw reload`)
- [ ] ใช้ IP address ที่ถูกต้อง (ไม่ใช่ localhost)
- [ ] อุปกรณ์อื่นอยู่ในเครือข่ายเดียวกัน
- [ ] ทดสอบจากเครื่องเดียวกันก่อน (localhost:4101)
- [ ] ไม่มี firewall software อื่นบล็อก (เช่น antivirus)

## 🌐 การทดสอบ

### 1. ทดสอบจากเครื่องเดียวกัน
```bash
curl http://localhost:4101
```

### 2. ทดสอบจากอุปกรณ์อื่น
เปิดเบราว์เซอร์บนอุปกรณ์อื่น:
```
http://<IP_ADDRESS>:4101
```

ตัวอย่าง: `http://192.168.40.15:4101`

### 3. ทดสอบด้วย telnet
```bash
telnet <IP_ADDRESS> 4101
```

ถ้าเชื่อมต่อได้ จะเห็น:
```
Connected to <IP_ADDRESS>
```

## ⚠️ ปัญหาที่อาจพบ

### Port ถูกใช้งานแล้ว
```bash
# หาว่า process ไหนใช้ port 4101
sudo lsof -i :4101
# หรือ
sudo netstat -tulpn | grep 4101
```

### Firewall บล็อกอยู่
```bash
# ตรวจสอบ UFW logs
sudo tail -f /var/log/ufw.log
```

### Network Interface ไม่ถูกต้อง
ใช้ IP address ที่แสดงจาก `hostname -I` หรือ `ip addr show`

## 💡 Tips

1. **ใช้ IP address จริง** - ไม่ใช้ localhost หรือ 127.0.0.1
2. **ตรวจสอบ Firewall ก่อน** - มักจะเป็นสาเหตุหลัก
3. **ทดสอบจากเครื่องเดียวกันก่อน** - เพื่อให้แน่ใจว่า server ทำงาน
4. **ตรวจสอบ network** - ให้แน่ใจว่าอยู่ในเครือข่ายเดียวกัน

## 📞 ยังแก้ไม่ได้?

1. ตรวจสอบ logs:
   ```bash
   # Next.js logs
   npm run dev
   ```

2. ตรวจสอบ system logs:
   ```bash
   sudo journalctl -xe
   ```

3. ทดสอบด้วย port อื่น:
   ```bash
   # เปลี่ยน port ใน package.json
   "dev": "next dev -p 3000 --hostname 0.0.0.0"
   ```

4. ตรวจสอบ router/network settings:
   - Port forwarding
   - Network isolation
   - VLAN settings


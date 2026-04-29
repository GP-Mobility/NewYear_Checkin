#!/bin/bash

echo "🔍 กำลังตรวจสอบการตั้งค่าเครือข่าย..."
echo ""

# Get IP address
IP=$(hostname -I | awk '{print $1}')
PORT=4101

echo "📍 IP Address: $IP"
echo "🔌 Port: $PORT"
echo ""

# Check if port is listening
echo "📡 ตรวจสอบว่า port $PORT กำลังฟังอยู่..."
if netstat -tuln 2>/dev/null | grep -q ":$PORT " || ss -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo "✅ Port $PORT กำลังฟังอยู่"
    netstat -tuln 2>/dev/null | grep ":$PORT " || ss -tuln 2>/dev/null | grep ":$PORT "
else
    echo "❌ Port $PORT ไม่ได้ฟังอยู่"
    echo "   กรุณารัน: npm run dev"
fi
echo ""

# Check firewall
echo "🔥 ตรวจสอบ Firewall..."
if command -v ufw &> /dev/null; then
    echo "UFW Status:"
    sudo ufw status | head -5
    echo ""
    echo "💡 หาก port ยังไม่เปิด ให้รัน:"
    echo "   sudo ufw allow $PORT/tcp"
    echo "   sudo ufw reload"
elif command -v firewall-cmd &> /dev/null; then
    echo "firewalld Status:"
    sudo firewall-cmd --list-ports 2>/dev/null | grep -q "$PORT" && echo "✅ Port $PORT เปิดอยู่" || echo "❌ Port $PORT ยังไม่เปิด"
    echo ""
    echo "💡 หาก port ยังไม่เปิด ให้รัน:"
    echo "   sudo firewall-cmd --permanent --add-port=$PORT/tcp"
    echo "   sudo firewall-cmd --reload"
else
    echo "⚠️  ไม่พบ UFW หรือ firewalld"
    echo "   อาจจะใช้ iptables หรือ firewall อื่น"
fi
echo ""

# Test connection
echo "🧪 ทดสอบการเชื่อมต่อ..."
if curl -s --connect-timeout 2 "http://localhost:$PORT" > /dev/null 2>&1; then
    echo "✅ Local connection: OK"
else
    echo "❌ Local connection: FAILED"
    echo "   Server อาจจะยังไม่รัน"
fi
echo ""

echo "🌐 URL สำหรับเข้าถึง:"
echo "   Local:    http://localhost:$PORT"
echo "   Network:  http://$IP:$PORT"
echo ""

echo "📋 Checklist:"
echo "   [ ] Server กำลังรัน (npm run dev)"
echo "   [ ] Port $PORT เปิดใน Firewall"
echo "   [ ] อุปกรณ์อื่นอยู่ในเครือข่ายเดียวกัน"
echo "   [ ] ใช้ IP address ที่ถูกต้อง: $IP"
echo ""


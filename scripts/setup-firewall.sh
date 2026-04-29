#!/bin/bash

PORT=4101

echo "🔥 กำลังตั้งค่า Firewall สำหรับ port $PORT..."
echo ""

# Detect firewall type
if command -v ufw &> /dev/null; then
    echo "📦 ใช้ UFW"
    echo ""
    echo "กำลังเปิด port $PORT..."
    sudo ufw allow $PORT/tcp
    echo ""
    echo "กำลัง reload firewall..."
    sudo ufw reload
    echo ""
    echo "✅ ตั้งค่าเสร็จสิ้น!"
    echo ""
    echo "ตรวจสอบสถานะ:"
    sudo ufw status | grep $PORT
    
elif command -v firewall-cmd &> /dev/null; then
    echo "📦 ใช้ firewalld"
    echo ""
    echo "กำลังเปิด port $PORT..."
    sudo firewall-cmd --permanent --add-port=$PORT/tcp
    echo ""
    echo "กำลัง reload firewall..."
    sudo firewall-cmd --reload
    echo ""
    echo "✅ ตั้งค่าเสร็จสิ้น!"
    echo ""
    echo "ตรวจสอบสถานะ:"
    sudo firewall-cmd --list-ports | grep $PORT
    
else
    echo "⚠️  ไม่พบ UFW หรือ firewalld"
    echo ""
    echo "กรุณาเปิด port $PORT ด้วยวิธีอื่น:"
    echo ""
    echo "สำหรับ iptables:"
    echo "  sudo iptables -A INPUT -p tcp --dport $PORT -j ACCEPT"
    echo "  sudo iptables-save"
    echo ""
    echo "หรือใช้ GUI firewall tool ของระบบ"
fi

echo ""
echo "🌐 หลังจากตั้งค่าแล้ว สามารถเข้าถึงได้ที่:"
IP=$(hostname -I | awk '{print $1}')
echo "   http://$IP:$PORT"


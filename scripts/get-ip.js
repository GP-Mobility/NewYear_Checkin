const os = require('os');

function getLocalIP() {
  const nets = os.networkInterfaces();
  const ips = [];
  
  Object.keys(nets).forEach((name) => {
    nets[name].forEach((net) => {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    });
  });
  
  return ips[0] || 'localhost';
}

const ip = getLocalIP();
const port = process.env.PORT || 4101;

console.log('\n🚀 Server starting...\n');
console.log('📍 Local:    http://localhost:' + port);
console.log('🌐 Network:  http://' + ip + ':' + port);
console.log('\n💡 Access from other devices using the Network URL above\n');

module.exports = { ip, port };


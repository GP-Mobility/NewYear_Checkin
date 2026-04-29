const { spawn } = require('child_process');
const path = require('path');

// Get IP and port
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

console.log('\n🚀 Starting Next.js Development Server...\n');
console.log('📍 Local:    http://localhost:' + port);
console.log('🌐 Network:  http://' + ip + ':' + port);
console.log('\n💡 Access from other devices using the Network URL above\n');
console.log('─'.repeat(50) + '\n');

// Start Next.js dev server
const nextDev = spawn('npx', ['next', 'dev', '-p', port.toString(), '--hostname', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

nextDev.on('error', (error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

nextDev.on('exit', (code) => {
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping server...');
  nextDev.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
  process.exit(0);
});


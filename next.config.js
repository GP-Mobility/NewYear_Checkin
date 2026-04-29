/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Network configuration
  // Server will listen on all network interfaces (0.0.0.0)
  // This allows access via IP address from other devices on the network
  // Output standalone for Docker
  output: 'standalone',
}

module.exports = nextConfig


#!/bin/bash

# Script to generate self-signed SSL certificate for development

SSL_DIR="nginx/ssl"
DOMAIN="${1:-localhost}"

echo "🔐 Generating self-signed SSL certificate for $DOMAIN..."

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# Generate private key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$SSL_DIR/key.pem" \
  -out "$SSL_DIR/cert.pem" \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Company/CN=$DOMAIN"

# Set proper permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo "✅ SSL certificate generated successfully!"
echo "📁 Certificate: $SSL_DIR/cert.pem"
echo "🔑 Private key: $SSL_DIR/key.pem"
echo ""
echo "⚠️  Note: This is a self-signed certificate for development only."
echo "   Browsers will show a security warning. For production, use Let's Encrypt."


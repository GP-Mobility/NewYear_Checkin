# SSL Certificates Directory

Place your SSL certificates here:

- `cert.pem` - SSL certificate file
- `key.pem` - SSL private key file

## For Development (Self-Signed Certificate)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Company/CN=yourdomain.com"
```

## For Production (Let's Encrypt)

Use certbot to generate certificates:

```bash
certbot certonly --standalone -d yourdomain.com
```

Then copy certificates:
```bash
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem key.pem
```


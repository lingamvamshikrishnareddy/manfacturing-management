#!/bin/bash
set -e

PROJECT="manufex"
DOMAIN="manufex.ramanv.com"
HOST_CONF="/etc/nginx/conf.d/${PROJECT}.conf"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
WEBROOT="/var/www/certbot"

# Check .env exists
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example and fill in values."
  exit 1
fi

# Install host router config + SSL if not done yet
if [ ! -f "$HOST_CONF" ]; then
  if [ ! -f "$CERT_PATH" ]; then
    echo "No SSL cert found. Writing temp HTTP-only config to get cert..."
    cat > "$HOST_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
    }

    location / {
        return 200 'temp';
        add_header Content-Type text/plain;
    }
}
EOF
    nginx -t && systemctl reload nginx

    mkdir -p "$WEBROOT"
    certbot certonly --webroot -w "$WEBROOT" -d "$DOMAIN" \
      --non-interactive --agree-tos -m admin@ramanv.com
  fi

  echo "Installing full SSL nginx config..."
  cp host-router/${PROJECT}.conf "$HOST_CONF"
  nginx -t && systemctl reload nginx
fi

# Build and start containers
docker compose up -d --build

echo "Deploy complete. Backend running on port 8022."

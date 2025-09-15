#!/bin/sh

# Substitute environment variables in the template file
# and output the result to the final nginx config file.
envsubst '$BACKEND_API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

# Start Nginx in the foreground
nginx -g 'daemon off;'
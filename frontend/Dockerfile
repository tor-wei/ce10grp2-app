# frontend/Dockerfile
FROM nginx:alpine


# Remove default nginx config
RUN rm /etc/nginx/nginx.conf


# Copy static files
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/

# Copy the config template and the entrypoint script
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

# ---- FIX 2: Run the entrypoint script on start, not nginx directly ----
CMD ["/entrypoint.sh"]
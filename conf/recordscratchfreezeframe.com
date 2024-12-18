upstream my_nodejs_upstream {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    server_name recordscratchfreezeframe.com www.recordscratchfreezeframe.com;

    location / {
    	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    	proxy_set_header Host $http_host;

    	proxy_http_version 1.1;
    	proxy_set_header Upgrade $http_upgrade;
    	proxy_set_header Connection "upgrade";

    	proxy_pass http://my_nodejs_upstream/;
    	proxy_redirect off;
    	proxy_read_timeout 240s;
    }



    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/recordscratchfreezeframe.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/recordscratchfreezeframe.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot



}


server {
    if ($host = recordscratchfreezeframe.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    server_name recordscratchfreezeframe.com;
    listen 80;
    return 404; # managed by Certbot


}
# mpi-monitoring

## Server setup instructions (on Ubuntu / Debian)

### 1. Install Node.js

> $ sudo apt-get update  
> $ sudo apt-get install nodejs  
> $ sudo apt-get install npm  
> $ node --version  

(should echo something greater than 10.0)

### 2. Install node process manager

> $ npm i -g pm2   

### 3. Install MongoDB

[tutorial](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

Example for Ubuntu 18.04 (Bionic)

> $ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4  
> $ echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list  
> $ sudo apt-get update  
> $ sudo apt-get install -y mongodb-org  

Run The Mongo Server:

> $ sudo service mongod start  

### 4. Install Nginx

[tutorial](https://mediatemple.net/community/products/developer/204405534/install-nginx-on-ubuntu)

> $ sudo apt-get update  
> $ sudo apt-get install nginx  

Setup Nginx:

> $ nano /etc/nginx/sites-available/mpi-monitoring

Add this to the file:

> server {  
> &nbsp;&nbsp;&nbsp;&nbsp;listen 80;  
> &nbsp;&nbsp;&nbsp;&nbsp;server_name *"hostname (i.e. mpi-monitoring.com)"*;  
> &nbsp;&nbsp;&nbsp;&nbsp;location / {  
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;proxy_pass http://127.0.0.1:3000;  
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;proxy_http_version 1.1;  
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;proxy_set_header Connection 'upgrade';  
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;proxy_set_header Host $host;  
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;proxy_cache_bypass $http_upgrade;  
> &nbsp;&nbsp;&nbsp;&nbsp;}  
> }  

Create a symlink in sites-enabled:

> $ ln -s /etc/nginx/sites-available/mpi-monitoring /etc/nginx/sites-enabled/mpi-monitoring  

Run Nginx:

> $ sudo service nginx start  

### 7. Run Certbot to configure ssl encryption

[tutorial](https://certbot.eff.org/lets-encrypt/)

Install certbot:

> $ sudo apt-get update  
> $ sudo apt-get install software-properties-common  
> $ sudo add-apt-repository universe  
> $ sudo add-apt-repository ppa:certbot/certbot  
> $ sudo apt-get update  
> $ sudo apt-get install certbot python-certbot-nginx   

Run certbot:

> $ sudo certbot --nginx  

### 6. Install this Repository

> $ cd ~  
> $ git clone https://github.com/snanglesvoid/mpi-monitoring  
> $ npm i  

Create Environment Variables:

> $ nano .env

Add these two lines

> PORT=3000   
> COOKIE_SECRET=*SOME_LONG_STREAM_OF_GIBBERISH_4309584KJH34K42J42*  

### 7. start the server

> $ cd ~/mpi-monitoring  
> $ pm2 start keystone.js --name=mpi-monitoring  

To monitor server resources:

> $ pm2 monit  

To view the server log output:

> $ pm2 log mpi-monitoring  
# Nodepad
Nodepad is a simple temporary note saving server written on Node.js; notes are stored in memory and automatically destroyed after 15 minutes.
## Setting up the server.
In the same directory as the server files, you need to provide a ssl certificate. The public key file should be server.crt and the private key file should be server.key.
## Starting the server
Install all of the dependencies with
```
npm install
```
Then start the server with
```
node app.js
```

# ChatServer-and-Client
Simple node chat server and client

Launch server with command "node chatServer.js"

Launch individual user with command "node newClient.js"

# Commands

/w - Sends a whisper to another connected client. For example: ‘/w Guest3 Hi’ Sends a message to Guest3 only.

/username - Updates the username of the client that sent the command. For example, if Guest2 sends ‘/username john’ then Guest2’s username is then updated to ‘john’.

/kick - Kicks another connected client, as long as the supplied admin password is correct. For example ‘/kick Guest3 supersecretpw’ will kick Guest3 from the chat.

/clientlist - sends a list of all connected client names.

# Notes

* The secret password for the /kick command is 'swordfish'

* User must choose name before obtaining full access to server

* User names can be composed of multiple words, should work as expected with commands

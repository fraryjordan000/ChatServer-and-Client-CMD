const net = require('net');
const fs = require('fs');

function getDate() {
  let d = new Date();
  let rtn = `[${d.getMonth()}/${d.getDate()}/${d.getFullYear()}%${d.getHours()}:${d.getMinutes()}] `;
  return rtn;
}

function serverLog(str, cb) {
  fs.appendFile('./server.log', getDate() + str + '\n', () => {if(cb != undefined) {cb()}});
}

let users = {};
let userCount = 0;

let server = net.createServer();

server.listen(5000);

server.on('connection', client => {
  let name;
  client.write('Welcome, please enter the name you want to use:');

  client.setEncoding('utf-8');

  function broadcast(str) {
    for(let i in users) {
      if(users[i] != client) {
        users[i].write(str);
      }
    }
    serverLog(str);
  }

  client.on('data', data => {
    let cInput = data.toString();
    cInput[cInput.length-1] = "";
    
    if(!name) {
      if(users[cInput]) {
        client.write('Name taken, try a different one');
        return;
      } else {
        name = cInput;
        userCount++;
        users[cInput] = client;

        client.write('[server]: Welcome to the chat server, '+cInput);

        broadcast('[server]: '+name+' has joined the server');
      }
    } else {
      broadcast(`[${name}]: ${cInput}\r\n`);
    }
  });

  client.on('close', () => {
    broadcast('[server]: '+name+' has left the server');
    delete users[name];
    userCount--;
  });

  client.on('error', error => {
    client.write('Error: '+error);
  })
});

server.on('error', error => {
  console.log('Error: '+error);
});

serverLog('Server Started');

let exiting = false;
process.on('SIGINT', () => {
  if(!exiting) {
    serverLog('Server Terminated', () => {
      process.exit();
    });
    exiting = true;
  }
});

console.log(`Listening on port 5000`);
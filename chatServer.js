const net = require('net');
const fs = require('fs');

function getDate() {
  let d = new Date();
  let rtn = `[${d.getMonth()}/${d.getDate()}/${d.getFullYear()}%${d.getHours()}:${d.getMinutes()}] `;
  return rtn;
}

function serverLog(str, cb) {
  fs.appendFile('./server.log', getDate() + str + '\n', () => { if (cb != undefined) { cb() } });
}

function deleteName(name) {
  for (let i in names) {
    if (names[i] == name) {
      names.splice(i, 1);
      break;
    }
  }
}

function listClients() {
  let rtn = "";
  for (let i in names) {
    if (i == names.length - 1) {
      rtn += names[i];
      break;
    }
    rtn += (names[i] + '\n');
  }
  return rtn;
}

let users = {};
let names = [];
let userCount = 0;

let secretPassword = 'swordfish';

let server = net.createServer();

server.listen(5000);

server.on('connection', client => {
  let name;
  client.write('Welcome, please enter the name you want to use:');

  client.setEncoding('utf-8');

  function broadcast(str) {
    for (let i in users) {
      if (users[i] != client) {
        users[i].write(str);
      }
    }
    serverLog(str);
  }

  client.on('data', data => {
    let cInput = data.toString();
    cInput = cInput.slice(0, -1);

    if (!name) {
      if (users[cInput]) {
        client.write('![error]: Name taken, try a different one');
        return;
      } else {
        name = cInput;
        userCount++;
        users[cInput] = client;

        client.write('[server]: Welcome to the chat server, ' + cInput);

        broadcast('[server]: ' + name + ' has joined the server');

        names.push(name);
      }
    } else {
      let tmp = cInput.split(' ');
      if (tmp[0] == '/w') {
        if (users[tmp[1]]) {
          let tmpName = tmp[1];
          tmp.splice(0, 2);
          users[tmpName].write(`{whisper}[${name}]: ${tmp.join(' ')}`);
        } else {
          client.write('![error]: Cannot find specified user');
        }
      } else if (tmp[0] == '/kick') {
        if(tmp[tmp.length-1] == secretPassword) {
          tmp.splice(0, 1);
          tmp.pop();
          tmp = tmp.join(' ');
          if(users[tmp] && tmp != name) {
            users[tmp].write(`\n![server]: You have been kicked by ${name}`);
            users[tmp].destroy();
          } else if(tmp == name) {
            client.write('![error]: Cannot kick yourself');
          } else {
            client.write(`![error]: '${tmp}' doesn't exist`);
          }
        } else {
          client.write('![error]: Invalid password');
        }
      } else if (tmp[0] == '/username') {
        if (!users[tmp[1]]) {
          tmp.splice(0, 1);
          tmp = tmp.join(' ');
          Object.defineProperty(users, tmp, Object.getOwnPropertyDescriptor(users, name));
          delete users[name];
          deleteName(name);
          client.write('[notice]: Name successfully changed to ' + tmp);
          broadcast('[server]: ' + name + ' has changed their name to ' + tmp);
          names.push(tmp);
          name = tmp;
        } else {
          client.write('![error]: Name already in use');
        }
      } else if (tmp[0] == '/clientlist') {
        client.write(listClients());
      } else {
        console.log(users);
        broadcast(`[${name}]: ${cInput}\r\n`);
      }
    }
  });

  client.on('close', () => {
    if(name) {
      broadcast('[server]: ' + name + ' has left the server');
      userCount--;
      deleteName(name);
      delete users[name];
    }
  });

  client.on('error', error => {
    client.write('![error]: ' + error);
  });
});

server.on('error', error => {
  console.log('![error]: ' + error);
});

serverLog('Server Started');

let exiting = false;
process.on('SIGINT', () => {
  if (!exiting) {
    serverLog('Server Terminated', () => {
      process.exit();
    });
    exiting = true;
  }
});

console.log(`Listening on port 5000`);
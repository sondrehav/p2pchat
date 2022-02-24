var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

app.use(function (req, res, next) {
  console.log('New client waiting for connection');
  return next();
});

app.get('/', function(req, res, next){
  res.end();
});

const connectingClients = [];

app.ws('/', function(ws, req) {
  connectingClients.push(ws);
  ws.on('close', () => {
    const index = connectingClients.indexOf(ws);
    console.log("client disconnected, index: ", index)
    if(index >= 0) connectingClients.splice(index, 1);
  })
  console.log("in: ", connectingClients.length);
  while(connectingClients.length > 1) {
    const client1 = connectingClients.shift();
    const client2 = connectingClients.shift();
    connectClients(client1, client2);
  }
  console.log("out: ",connectingClients.length);
});

const connectClients = (client1, client2) => {
  client1.send(JSON.stringify({ type: "init" }));
  client1.on('message', function(msg) {
    console.log(`client 1 message: ${msg}`);
    client2.send(msg);
  });
  client2.on('message', function(msg) {
    console.log(`client 2 message: ${msg}`);
    client1.send(msg);
  });
  client1.on('close', () => {
    console.log("client 1 closed.");
  });
  client2.on('close', () => {
    console.log("client 2 closed.");
  });
}

console.log("server listening on 3000");
app.listen(3000);
const http = require('http');
const fs = require('fs');
const websocket = require('ws');

// const server = https.createServer({
//   cert: fs.readFileSync('cert.pem'),
//   key: fs.readFileSync('key.pem')
// });

const imagebuffer = fs.readFileSync('testimage.jpg');
const b64image = imagebuffer.toString('base64');

const server = http.createServer();

const wss = new websocket.WebSocketServer({ server });

wss.on('connection', function connection(ws) {
   const id = setInterval(function(){
    ws.send(JSON.stringify({x:Math.random()*100, y:Math.random()*100, image:b64image}))
   },100);
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
  ws.on('close',function(){
    clearInterval(id);
  })

  //ws.send('something');
});


server.listen(8081);
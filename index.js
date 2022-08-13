const http = require('http');
const fs = require('fs');
const websocket = require('ws');

const winscreencap = require('./build/Release/winscreencap');

const test = new winscreencap.WinScreenCap(1);


// const server = https.createServer({
//   cert: fs.readFileSync('cert.pem'),
//   key: fs.readFileSync('key.pem')
// });

// const imagebuffer = fs.readFileSync('testimage.jpg');
// const b64Image = imagebuffer.toString('base64');
const server = http.createServer();


//Webpack dev server Inject False ... double loading
const websocketClients = new Set();

const wss = new websocket.WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  websocketClients.add(ws);
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
  ws.on('close',function(){
    websocketClients.delete(ws);
  })
});

let rightScreen = null;
let leftScreen = null;
const id = setInterval(function(){
  rightScreen = test.CaptureScreen(0);
  leftScreen = test.CaptureScreen(1);
  websocketClients.forEach((client)=>{
    client.send(JSON.stringify({x:0, y:0, image:rightScreen}));
    client.send(JSON.stringify({x:-1920, y:0, image:leftScreen}));
  })
},100);


server.listen(8081);
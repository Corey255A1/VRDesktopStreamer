const http = require('http');
const fs = require('fs');
const websocket = require('ws');

const winscreencap = require('./build/Release/winscreencap');

const screen_manager = new winscreencap.WinScreenCap();

const screen_regions = screen_manager.GetScreenInfo();
console.log(screen_regions);


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

wss.on('connection', function connection(client) {
  websocketClients.add(client);
  client.on('message', function message(data) {
    console.log('received: %s', data);
  });
  client.on('close',function close(){
    websocketClients.delete(client);
  });

  client.send(JSON.stringify({cmd:"init",screens:screen_regions}));


});

const id = setInterval(function(){
  screen_regions.forEach((region, idx)=>{
    const screen = screen_manager.CaptureScreen(idx);
    websocketClients.forEach((client)=>{
      client.send(JSON.stringify({cmd:"update",screen:{x:region.x, y:region.y, width:region.width, height:region.height, image:screen}}));
    })
  })
},100);


server.listen(8081);
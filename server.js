


const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();

app.use(express.static('./app'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.broadcast = function broadcast ( data ) {
    wss.clients.forEach(function each ( client ) {
        client.send(data);
    });
}

var dataArr = [];
wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);

    console.log('connection build successful');
    fs.readFile('data.txt', function ( err, data ) {
        if ( err ) {
            return console.log( err );
        }
        ws.send(data.toString());
    });

    ws.on('message', function incoming(message) {
        var jsonData = JSON.parse( message );
        dataArr.push(jsonData);
        var stringData = JSON.stringify(dataArr);
        fs.writeFile('data.txt', stringData, function ( err ){
            if ( err ) {
                return console.log(err);
            }
            console.log('数据写入成功');
        })
    });
});

server.listen(3000, function listening() {
    console.log('Listening on %d', server.address().port);
});
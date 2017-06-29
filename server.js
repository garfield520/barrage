var WebSoketServer = require('ws').Server,
    wss = new WebSoketServer({port: 3000});

var fs = require('fs');

wss.broadcast = function broadcast ( data ) {
    wss.clients.forEach(function each ( client ) {
        client.send(data);
    });
}

var arr = [];

wss.on('connection', function ( ws ){
    console.log('connection build successful');
    fs.readFile('data.txt', function ( err, data ) {
        if ( err ) {
            return console.log( err );
        }
        ws.send(data.toString());
    });

    ws.on('message', function incoming(data) {
        var jsonData = JSON.parse(data);
        wss.broadcast( data );

        arr.push(jsonData);
        
        var stringData = JSON.stringify(arr)
        fs.writeFile('data.txt', stringData, function ( err ){
            if ( err ) {
                return console.log(err);
            }
            console.log('数据写入成功');
        })
    });

});


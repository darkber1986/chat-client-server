"use strict";
exports.__esModule = true;
exports.Message = void 0;
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var num = 1;
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server });
function createMessage(content, sender, idSender) {
    if (sender === void 0) { sender = 'NS'; }
    if (idSender === void 0) { idSender = 0; }
    return JSON.stringify(new Message(content, sender, idSender));
}
function updateTotal() {
    return JSON.stringify({ total: wss.clients.size });
}
app.get("/getTotalUsers", function (req, res) {
    var total = wss.clients.size;
    res.json({ total: total });
});
var Message = /** @class */ (function () {
    function Message(content, sender, idSender) {
        if (idSender === void 0) { idSender = 1; }
        this.content = content;
        this.sender = sender;
        this.idSender = idSender;
    }
    return Message;
}());
exports.Message = Message;
wss.on('connection', function (ws) {
    var extWs = ws;
    extWs.isAlive = true;
    ws.on('pong', function () {
        extWs.isAlive = true;
    });
    setTimeout(function () {
        wss.clients.forEach(function (client) {
            client.send(updateTotal());
        });
    }, 10);
    ws.on('message', function (msg) {
        var message = JSON.parse(msg);
        setTimeout(function () {
            wss.clients.forEach(function (client) {
                if (client != ws) {
                    client.send(createMessage(message.content, message.sender, message.idSender));
                }
            });
        }, 10);
    });
    ws.on('error', function (err) {
        console.warn("Client disconnected - reason: " + err);
    });
});
setInterval(function () {
    wss.clients.forEach(function (ws) {
        var extWs = ws;
        if (!extWs.isAlive)
            return ws.terminate();
        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port 8999 :)");
});

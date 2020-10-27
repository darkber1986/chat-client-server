import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

var num = 1;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

function createMessage(content: string, sender = 'NS', idSender = 0): string {
    return JSON.stringify(new Message(content, sender, idSender));
}
function updateTotal(): string {
    return JSON.stringify({total:wss.clients.size});
}
app.get( "/getTotalUsers", ( req, res ) => {
    const total = wss.clients.size;
    res.json({total:total});
});
export class Message {
    constructor(
        public content: string,
        public sender: string,
	public idSender = 1
    ) { }
}

wss.on('connection', (ws: WebSocket) => {
    const extWs = ws as ExtWebSocket;
    extWs.isAlive = true;
    ws.on('pong', () => {
        extWs.isAlive = true;
    });
    setTimeout(() => {
    	wss.clients.forEach(client => {
             client.send(updateTotal());
        });
    }, 10);
    ws.on('message', (msg: string) => {
        const message = JSON.parse(msg) as Message;
        setTimeout(() => {
     		wss.clients.forEach(client => {
   	           	if (client != ws) {
                            client.send(createMessage(message.content, message.sender, message.idSender));
                        }
                });
        }, 10);
    });
    ws.on('error', (err) => {
        console.warn(`Client disconnected - reason: ${err}`);
    })
});

setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
        const extWs = ws as ExtWebSocket;
        if (!extWs.isAlive) return ws.terminate();
        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port 8999 :)`);
});

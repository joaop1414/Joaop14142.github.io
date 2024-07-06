const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let clients = [];

server.on('connection', (ws) => {
    clients.push(ws);
    console.log('New client connected.');

    ws.on('message', (message) => {
        console.log('Received: %s', message);
        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected.');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error: ', error);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

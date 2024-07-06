const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let rooms = {};
let clients = {};

wss.on('connection', (ws) => {
    console.log('New client connected.');

    ws.on('message', (message) => {
        const msg = JSON.parse(message);

        if (msg.type === 'createRoom') {
            const roomId = generateRoomId();
            rooms[roomId] = {
                players: [msg.playerName],
                direction: 'right',
                snake: [{ x: 9 * 20, y: 10 * 20 }],
                food: generateFood()
            };
            clients[ws] = { roomId, playerName: msg.playerName };
            ws.send(JSON.stringify({ type: 'roomCreated', roomId: roomId }));
        } else if (msg.type === 'direction') {
            const room = rooms[clients[ws].roomId];
            room.direction = msg.direction;
        } else if (msg.type === 'food') {
            const room = rooms[clients[ws].roomId];
            room.food = msg.food;
        } else if (msg.type === 'update') {
            const room = rooms[clients[ws].roomId];
            const snake = room.snake;

            if (room.direction === 'left') snake[0].x -= 20;
            if (room.direction === 'right') snake[0].x += 20;
            if (room.direction === 'up') snake[0].y -= 20;
            if (room.direction === 'down') snake[0].y += 20;

            // Verifica colisão com a borda do canvas
            if (snake[0].x < 0 || snake[0].x >= 400 || snake[0].y < 0 || snake[0].y >= 400) {
                console.log('Game Over: Border Collision');
                alert('Game Over: Colisão com a borda')
                return;
            }

            // Verifica colisão com a própria cobra
            for (let i = 1; i < snake.length; i++) {
                if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
                    console.log('Game Over: Self Collision');
                    alert('Game Over: Colidiu em si mesmo)
                    return;
                }
            }

            // Atualiza a comida
            if (snake[0].x === room.food.x && snake[0].y === room.food.y) {
                room.food = generateFood();
                room.snake.push({ x: snake[0].x, y: snake[0].y });
            }

            const update = {
                type: 'update',
                snake: room.snake,
                food: room.food,
                direction: room.direction
            };

            for (const client in clients) {
                if (clients[client].roomId === roomId) {
                    clients[client].send(JSON.stringify(update));
                }
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        alert('Cliente desconectado')
        const roomId = clients[ws]?.roomId;
        if (roomId && rooms[roomId]) {
            delete rooms[roomId];
            console.log(`Room ${roomId} closed.`);
        }
        delete clients[ws];
    });
});

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * 19 + 1) * 20,
        y: Math.floor(Math.random() * 19 + 1) * 20
    };
}

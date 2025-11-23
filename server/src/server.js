const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Load game config
const configPath = path.join(__dirname, '../../shared/config/game-config.json');
let gameConfig;

try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    gameConfig = JSON.parse(configFile);
    console.log('Game config loaded successfully');
} catch (error) {
    console.error('Error loading game config:', error.message);
}

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
    });

    socket.on('ping', () => {
        socket.emit('pong');
    });

    socket.on('input', (data) => {
        console.log(`Player ${socket.id} pressed ${data.key} (${data.state})`);
        io.emit('input_echo', { id: socket.id, ...data });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const CANNON = require('cannon-es');

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

// --- Physics Setup ---
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});

const carBody = new CANNON.Body({
    mass: 850, // kg
    position: new CANNON.Vec3(0, 5, 0), // m
    shape: new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)), // Half extents (2x1x4 total)
});
world.addBody(carBody);

// --- Game Loop ---
const timeStep = 1 / 60; // seconds
let frameCount = 0;

setInterval(() => {
    world.step(timeStep);
    frameCount++;

    if (frameCount % 60 === 0) {
        console.log(`Car Y: ${carBody.position.y.toFixed(2)}`);
    }
}, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

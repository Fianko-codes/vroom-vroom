import { io } from "socket.io-client";
import * as THREE from 'three';

// --- Socket.IO Connection ---
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("pong", () => {
    console.log("pong received");
});

// Send ping every 2 seconds
setInterval(() => {
    if (socket.connected) {
        console.log("Sending ping...");
        socket.emit("ping");
    }
}, 2000);


// --- Input Handling ---
const keys = {
    'w': false,
    'a': false,
    's': false,
    'd': false,
    ' ': false
};

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key) && !keys[key]) {
        keys[key] = true;
        console.log(`Key pressed: ${key}`);
        socket.emit('input', { key, state: 'down' });
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
        console.log(`Key released: ${key}`);
        socket.emit('input', { key, state: 'up' });
    }
});

// --- Three.js Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Cyan
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();

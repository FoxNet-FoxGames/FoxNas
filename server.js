const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = 80;

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => {
    res.status(200).send('pong');
});

const USER_DATA_DIR = path.join(__dirname, 'users');
app.use(express.static(__dirname)); 
app.use('/user-assets', express.static(USER_DATA_DIR));

const scriptsPath = path.join(__dirname, 'backend');

if (fs.existsSync(scriptsPath)) {
    fs.readdirSync(scriptsPath).forEach(file => {
        if (file.endsWith('.js')) {
            const modulePath = path.join(scriptsPath, file);
            const routeHandler = require(modulePath);
            
            // Spezielle Behandlung für Chat (bekommt io Instanz)
            if (file === 'chat.js') {
                routeHandler(io); // Chat initialisieren
                console.log(`\x1b[32m[Loaded]\x1b[0m Chat-Module: ${file}`);
            }
            // Spezielle Behandlung für keybindsave.js
            else if (file === 'keybindsave.js') {
                app.post('/api/save-keybinds', routeHandler);
                console.log(`\x1b[32m[Loaded]\x1b[0m API Route: /api/save-keybinds (${file})`);
            } 
            // Standard-Laden für Module (bekommen app Instanz)
            else if (typeof routeHandler === 'function') {
                try {
                    routeHandler(app);
                    console.log(`\x1b[32m[Loaded]\x1b[0m Script: ${file}`);
                } catch (e) {
                    console.log(`\x1b[33m[Info]\x1b[0m Script ${file} geladen.`);
                }
            }
        }
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'FoxNas.html'));
});

function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses;
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[36mFOXNAS v1.1.2 ONLINE\x1b[0m`);
    const ips = getLocalIPs();
    if (ips.length === 0) {
        console.log('Keine lokale Netzwerkadresse gefunden.');
    } else {
        console.log('Im Netzwerk erreichbar unter:');
        ips.forEach(ip => {
            console.log(`http://${ip}:${PORT}`);
        });
    }
});
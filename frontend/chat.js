/**
 * FOXNAS Live-Chat Module (3.07)
 */

// Socket.io Client laden (Das Skript wird automatisch vom Server bereitgestellt)
const socket = io();

// Nachrichten empfangen
socket.on('chatMessage', (msg) => {
    const log = document.getElementById('logConsole');
    if (!log) return;

    const entry = document.createElement('div');
    entry.style.padding = '2px 0';
    entry.style.borderBottom = '1px solid rgba(0, 242, 255, 0.05)';
    
    // System-Nachrichten farblich abheben
    if (msg.includes('System:')) {
        entry.style.color = 'var(--accent)';
    } else {
        entry.style.color = 'var(--primary)';
    }

    entry.innerText = msg;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
});

// Nachricht senden
function sendChatMessage() {
    const input = document.getElementById('chatMessage');
    const message = input.value.trim();
    if (!message) return;

    // Nutze den eingeloggten User (aus deinem Auth-System)
    // Falls window.permissions noch nicht existiert, nutzen wir einen Platzhalter
    const username = (window.permissions && window.permissions.name) ? window.permissions.name : "Admin";

    socket.emit('chatMessage', { username, message });
    input.value = '';
}

// Event Listener für Input
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatMessage');
    if(chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
});
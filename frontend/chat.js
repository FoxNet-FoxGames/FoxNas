/**
 * FOXNAS Live-Chat Module (3.07) - Multilanguage Fixed
 */
const socket = io();

// Nachrichten empfangen
socket.on('chatMessage', (msg) => {
    const log = document.getElementById('logConsole');
    if (!log) return;

    const entry = document.createElement('div');
    entry.style.padding = '2px 0';
    entry.style.borderBottom = '1px solid rgba(0, 242, 255, 0.05)';
    
    if (msg.includes('System:')) {
        entry.style.color = 'var(--accent)';
    } else {
        entry.style.color = 'var(--primary)';
    }

    entry.innerText = msg;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
});

function sendChatMessage() {
    const input = document.getElementById('chatMessage');
    const message = input.value.trim();
    if (!message) return;

    const username = (window.permissions && window.permissions.name) ? window.permissions.name : "Admin";
    socket.emit('chatMessage', { username, message });
    input.value = '';
}

// Zentrale Funktion zum Texte austauschen
function updateChatUI() {
    console.log("CHAT: Update UI mit Sprache...");
    const chatInput = document.getElementById('chatMessage');
    const sendBtn = document.querySelector('.chat-input button');
    const chatHeader = document.querySelector('.chat-panel .panel-header');

    if (LanguageEngine.dict && LanguageEngine.dict.chat) {
        const lang = LanguageEngine.dict.chat;
        if (chatInput) chatInput.placeholder = lang.placeholder;
        if (sendBtn) sendBtn.innerText = lang.btn_send;
        if (chatHeader) chatHeader.innerText = lang.header;
    }
}

// 1. Wenn die Sprache bereit ist -> Update
document.addEventListener('languageReady', () => {
    updateChatUI();
});

// 2. Wenn das DOM geladen ist -> Event Listener binden & Initial-Check
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatMessage');
    
    // Falls LanguageEngine schon fertig war, bevor der Chat geladen wurde:
    if (LanguageEngine.dict && LanguageEngine.dict.chat) {
        updateChatUI();
    }

    if(chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
});
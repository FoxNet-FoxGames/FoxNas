/**
 * FOXNAS Live-Chat Module (v3.10)
 * * Features:
 * - Realtime Socket.io Kommunikation
 * - Dynamische Sprachumschaltung
 * - Automatisierte Sound-Trigger für FoxSounds
 */

const socket = io();

/**
 * Event: Eingehende Nachrichten verarbeiten
 * Wird vom Server getriggert, wenn jemand eine Nachricht sendet.
 */
socket.on('chatMessage', (msg) => {
    const log = document.getElementById('logConsole');
    if (!log) return;

    // Erstellen des Nachrichten-Elements
    const entry = document.createElement('div');
    entry.style.padding = '2px 0';
    entry.style.borderBottom = '1px solid rgba(0, 242, 255, 0.05)';
    
    // System-Nachrichten (z.B. Logins) farblich absetzen
    if (msg.includes('System:')) {
        entry.style.color = 'var(--accent)';
    } else {
        entry.style.color = 'var(--primary)';
    }

    entry.innerText = msg;
    log.appendChild(entry);

    // Automatischer Scroll zum Ende der Konsole
    log.scrollTop = log.scrollHeight;

    /**
     * SOUND INJECTION LOGIK
     * Wir prüfen anhand des Namens, ob die Nachricht von uns selbst kommt 
     * oder von einem anderen User/System, und loggen das entsprechende Event.
     */
    const myName = (window.permissions && window.permissions.name) ? window.permissions.name : "Admin";
    
    if (msg.startsWith(`${myName}:`)) {
        // Event für eigene gesendete Nachricht
        console.log("MessageSend"); 
    } else if (!msg.includes('System:')) {
        // Event für empfangene Nachricht von anderen
        console.log("MessageReceived");
    }
});

/**
 * Funktion: Nachricht an den Server senden
 */
function sendChatMessage() {
    const input = document.getElementById('chatMessage');
    const message = input.value.trim();
    
    // Leere Nachrichten ignorieren
    if (!message) return;

    // Benutzername aus den globalen Berechtigungen beziehen
    const username = (window.permissions && window.permissions.name) ? window.permissions.name : "Admin";
    
    // Senden via Socket
    socket.emit('chatMessage', { username, message });
    
    // Input-Feld leeren
    input.value = '';
}

/**
 * Funktion: Übersetzungen anwenden
 * Aktualisiert Placeholder und Button-Texte basierend auf der LanguageEngine.
 */
function updateChatUI() {
    console.log("CHAT: Update UI mit Sprache...");
    const chatInput = document.getElementById('chatMessage');
    const sendBtn = document.querySelector('.chat-input button');
    const chatHeader = document.querySelector('.chat-panel .panel-header');

    if (window.LanguageEngine && LanguageEngine.dict && LanguageEngine.dict.chat) {
        const lang = LanguageEngine.dict.chat;
        if (chatInput) chatInput.placeholder = lang.placeholder;
        if (sendBtn) sendBtn.innerText = lang.btn_send;
        if (chatHeader) chatHeader.innerText = lang.header;
    }
}

/**
 * Event-Listener: Sprache wurde gewechselt
 */
document.addEventListener('languageReady', () => {
    updateChatUI();
});

/**
 * Initialisierung beim Laden des Dokuments
 */
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatMessage');
    
    // Initialer UI-Check falls Sprache bereits geladen war
    if (window.LanguageEngine && LanguageEngine.dict && LanguageEngine.dict.chat) {
        updateChatUI();
    }

    // Event-Listener für das Senden per Enter-Taste
    if(chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Verhindert Zeilenumbruch
                sendChatMessage();
            }
        });
    }
});
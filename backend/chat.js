/**
 * FOXNAS Chat-Backend (v3.07)
 * Wird dynamisch von server.js geladen
 */
module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log(`chat: \x1b[35m[CHAT]\x1b[0m User verbunden: ${socket.id}`);

        // Nachricht empfangen und an alle senden
        socket.on('chatMessage', (data) => {
            if (!data.username || !data.message) return;
            
            const formattedMsg = `[${new Date().toLocaleTimeString()}] ${data.username}: ${data.message}`;
            
            // Broadcast an alle verbundenen Clients
            io.emit('chatMessage', formattedMsg);
            
            console.log(`chat: \x1b[35m[CHAT]\x1b[0m ${data.username}: ${data.message}`);
        });

        socket.on('disconnect', () => {
            console.log(`chat: \x1b[35m[CHAT]\x1b[0m User getrennt: ${socket.id}`);
        });
    });
};
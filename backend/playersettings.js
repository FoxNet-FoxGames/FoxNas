const fs = require('fs');
const path = require('path');
const USERS_FILE = path.join(__dirname, '../users/users.json');

module.exports = (app) => {
    app.post('/api/player/config', (req, res) => {
        const { username, config } = req.body;
        try {
            let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
            const userIdx = users.findIndex(u => u.user === username);
            
            if (userIdx !== -1) {
                // Speichere EQ-Werte und Keybinds im User-Objekt
                users[userIdx].foxplayer = {
                    eq: config.eq || [0, 0, 0, 0, 0],
                    keybinds: config.keybinds || {}
                };
                fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
                return res.json({ success: true });
            }
            res.status(404).send("User nicht gefunden");
        } catch (e) {
            res.status(500).send(e.message);
        }
    });
};
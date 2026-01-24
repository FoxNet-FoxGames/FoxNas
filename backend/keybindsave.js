const fs = require('fs');
const path = require('path');

module.exports = function(req, res) {
    // Prüfen, ob req.body überhaupt existiert (Middleware Check)
    if (!req.body) {
        return res.status(400).json({ error: "No data received" });
    }

    const { username, config } = req.body;
    
    if (!username) {
        return res.status(401).json({ error: "Not logged in" });
    }

    // Pfad: FoxNas/user/admin.json
    const userPath = path.join(__dirname, `../foxnas/user/${username}.json`);

    let userConfig = {};
    try {
        if (fs.existsSync(userPath)) {
            userConfig = JSON.parse(fs.readFileSync(userPath, 'utf8'));
        }
        
        // Keybinds in der JSON speichern
        userConfig.keybinds = config;

        fs.writeFileSync(userPath, JSON.stringify(userConfig, null, 4));
        res.json({ success: true });
    } catch (err) {
        console.error("keybindsave: Save Error:", err);
        res.status(500).json({ error: "Failed to save config" });
    }
};
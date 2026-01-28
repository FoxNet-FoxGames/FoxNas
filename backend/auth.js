const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const session = require('express-session');

// Pfad zum User-Ordner
const USER_DIR = path.join(__dirname, '..', 'user');

// Sicherstellen, dass der Ordner existiert
if (!fsSync.existsSync(USER_DIR)) {
    fsSync.mkdirSync(USER_DIR, { recursive: true });
}

async function getUserConfig(username) {
    try {
        const userPath = path.join(USER_DIR, `${username}.json`);
        if (!fsSync.existsSync(userPath)) return null;
        const data = await fs.readFile(userPath, 'utf8');
        return JSON.parse(data);
    } catch (err) { return null; }
}

module.exports = (app) => {
    app.use(session({
        secret: 'foxnas_cyber_secret_2026',
        resave: true,
        saveUninitialized: false,
        rolling: true,
        cookie: { 
            maxAge: 3600000, // 1 Stunde statt 1 Minute für bessere UX
            secure: false, 
            httpOnly: true,
            sameSite: 'lax'
        }
    }));

    app.get('/api/check-auth', (req, res) => {
        if (req.session && req.session.user) {
            res.json({ success: true, ...req.session.user });
        } else {
            res.json({ success: false });
        }
    });

    app.post('/api/login', async (req, res) => {
        try {
            const { user, pass } = req.body;
            if (!user || !pass) return res.status(400).json({ success: false });

            const userConfig = await getUserConfig(user);
            
            // Login Validierung gegen die individuelle JSON
            if (userConfig && userConfig.pass === pass) {
                const safeConfig = { ...userConfig };
                delete safeConfig.pass; // Passwort niemals ans Frontend senden
                
                req.session.user = { config: safeConfig, quickpaths: [] };
                
                req.session.save((err) => {
                    if (err) return res.status(500).json({ success: false });
                    res.json({ success: true, config: safeConfig, quickpaths: [] });
                });
            } else {
                res.status(401).json({ success: false });
            }
        } catch (e) { res.status(500).json({ success: false }); }
    });

    app.post('/api/logout', (req, res) => {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({ success: true });
        });
    });
};
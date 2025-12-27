const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const session = require('express-session');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

async function getUsers() {
    try {
        if (!fsSync.existsSync(CONFIG_PATH)) return [];
        const data = await fs.readFile(CONFIG_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) { return []; }
}

module.exports = (app) => {
    app.use(session({
        secret: 'foxnas_cyber_secret_2025',
        resave: true,
        saveUninitialized: false,
        rolling: true,
        cookie: { 
            maxAge: 60000, 
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
            const users = await getUsers();
            const userConfig = users.find(u => u.user === user && u.pass === pass);
            
            if (userConfig) {
                const safeConfig = { ...userConfig };
                delete safeConfig.pass;
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
// backend/save.js
const fs = require('fs');
const path = require('path');
const ROOT_PATH = path.join(__dirname, '..', '..'); // Pfad anpassen an deine Struktur

module.exports = function(app) {
    app.post('/api/save-text', (req, res) => {
        const { filePath, content } = req.body;
        if (!filePath) return res.status(400).send('Pfad fehlt');

        // Sicherheit: Pfad bereinigen
        const cleanPath = filePath.replace(/^[\\/]+/, '');
        const fullPath = path.resolve(ROOT_PATH, cleanPath);

        fs.writeFile(fullPath, content, 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Fehler beim Speichern');
            }
            res.json({ success: true });
        });
    });
};
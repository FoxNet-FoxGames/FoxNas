const fs = require('fs');
const path = require('path');
const ROOT_DRIVE = path.resolve(__dirname, '../..');
const TRASH_DIR = path.join(ROOT_DRIVE, '.trash');

// Sicherstellen, dass der Papierkorb existiert
if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR, { recursive: true });
}

function joinToRoot(relPath) {
    const safePath = path.normalize(relPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const abs = path.join(ROOT_DRIVE, safePath);
    if (!abs.startsWith(ROOT_DRIVE)) throw new Error('Pfad-Verletzung');
    return abs;
}

module.exports = (app) => {
    app.post('/api/delete', async (req, res) => {
        const { files, dir, permanent } = req.body;

        if (!files || !Array.isArray(files)) {
            return res.status(400).json({ error: 'Keine Dateien ausgewählt' });
        }

        try {
            for (const fileName of files) {
                const sourcePath = joinToRoot(path.join(dir, fileName));

                if (permanent) {
                    // Endgültig löschen
                    fs.rmSync(sourcePath, { recursive: true, force: true });
                } else {
                    // In den Papierkorb verschieben
                    const timestamp = Date.now();
                    const trashPath = path.join(TRASH_DIR, `${timestamp}_${fileName}`);
                    fs.renameSync(sourcePath, trashPath);
                }
            }
            res.json({ success: true, message: permanent ? 'Endgültig gelöscht' : 'In Papierkorb verschoben' });
        } catch (err) {
            console.error('Delete Error:', err);
            res.status(500).json({ error: err.message });
        }
    });
};
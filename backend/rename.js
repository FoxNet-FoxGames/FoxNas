const fs = require('fs');
const path = require('path');
const ROOT_DRIVE = path.resolve(__dirname, '../..');

function joinToRoot(relPath) {
    const safePath = path.normalize(relPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const abs = path.join(ROOT_DRIVE, safePath);
    if (!abs.startsWith(ROOT_DRIVE)) throw new Error('Pfad-Verletzung');
    return abs;
}

module.exports = (app) => {
    app.post('/api/rename', async (req, res) => {
        const { dir, oldName, newName } = req.body;

        if (!oldName || !newName || oldName === newName) {
            return res.status(400).json({ error: 'Ungültiger Name' });
        }

        try {
            const oldPath = joinToRoot(path.join(dir, oldName));
            const newPath = joinToRoot(path.join(dir, newName));

            if (fs.existsSync(newPath)) {
                return res.status(400).json({ error: 'Datei existiert bereits' });
            }

            fs.renameSync(oldPath, newPath);
            res.json({ success: true });
        } catch (err) {
            console.error('Rename Error:', err);
            res.status(500).json({ error: err.message });
        }
    });
};
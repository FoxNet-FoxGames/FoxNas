const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const ROOT_DRIVE = path.resolve(__dirname, '../..');

function joinToRoot(relPath) {
    const safePath = path.normalize(relPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const abs = path.join(ROOT_DRIVE, safePath);
    if (!abs.startsWith(ROOT_DRIVE)) throw new Error('Pfad-Verletzung');
    return abs;
}

module.exports = (app) => {
    app.get('/api/list', async (req, res) => {
        try {
            const { dir } = req.query;
            const abs = joinToRoot(dir);
            const entries = await fs.readdir(abs, { withFileTypes: true });
            const result = await Promise.all(entries.map(async (ent) => {
                try {
                    const stat = await fs.stat(path.join(abs, ent.name));
                    return { name: ent.name, isDirectory: ent.isDirectory(), size: stat.size };
                } catch { return null; }
            }));
            res.json({ entries: result.filter(e => e !== null) });
        } catch (err) { res.status(400).json({ error: err.message }); }
    });

    app.get('/api/download', (req, res) => {
        try {
            const abs = joinToRoot(req.query.path);
            res.download(abs);
        } catch (e) { res.status(400).send(e.message); }
    });

    app.get('/api/download-folder', async (req, res) => {
        try {
            const absPath = joinToRoot(req.query.path);
            const folderName = path.basename(absPath);
            const zip = new AdmZip();
            zip.addLocalFolder(absPath);
            const zipBuffer = zip.toBuffer();
            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${folderName}.zip"`,
                'Content-Length': zipBuffer.length
            });
            res.send(zipBuffer);
        } catch (e) { res.status(500).send("Fehler beim Zippen: " + e.message); }
    });
};
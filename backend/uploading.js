const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ROOT_DRIVE = path.resolve(__dirname, '../..');

function joinToRoot(relPath) {
    const safePath = path.normalize(relPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const abs = path.join(ROOT_DRIVE, safePath);
    if (!abs.startsWith(ROOT_DRIVE)) throw new Error('Pfad-Verletzung');
    return abs;
}

module.exports = (app) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const targetDir = joinToRoot(req.query.dir);
                // Sicherstellen, dass der Ordner existiert
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                cb(null, targetDir);
            } catch (err) {
                cb(err);
            }
        },
        filename: (req, file, cb) => {
            // Wir behalten den originalen Namen bei
            cb(null, file.originalname);
        }
    });

    const upload = multer({ 
        storage,
        limits: { fileSize: 1024 * 1024 * 1024 * 5 } // Limit: 5GB (anpassbar)
    });

    // POST Route für Datei-Uploads
    app.post('/api/upload', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'Keine Datei empfangen' });
        }
        console.log(`uploading: [SYSTEM] Upload abgeschlossen: ${req.file.originalname} -> ${req.query.dir}`);
        res.json({ ok: true, filename: req.file.originalname });
    });
};
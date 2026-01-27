const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sessionGuard, canWrite } = require('./authManager');

// Zielt auf den Ordner ÜBER dem FoxNas-Verzeichnis (echtes Root der HDD)
const ROOT_DRIVE = path.resolve(__dirname, '../..'); 

module.exports = (app) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let relDir = req.query.dir || '';
            // Säuberung: Verhindert, dass man mit ".." aus der Festplatte ausbricht
            const safeRelDir = path.normalize(relDir).replace(/^(\.\.(\/|\\|$))+/, '');
            const targetDir = path.join(ROOT_DRIVE, safeRelDir);
            
            console.log(`[FILE_SYSTEM] Ziel-Pfad: ${targetDir}`);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            cb(null, targetDir);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });

    const upload = multer({ 
        storage,
        limits: { fileSize: 1024 * 1024 * 1024 * 10 } // Erhöht auf 10GB für NAS-Zwecke
    });

    app.post('/api/upload', sessionGuard, canWrite, (req, res) => {
        upload.single('file')(req, res, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!req.file) return res.status(400).json({ error: 'Feldname falsch oder keine Datei.' });

            console.log(`uploading: [STORAGE] Datei abgelegt: ${req.file.originalname} in ${req.query.dir}`);
            res.json({ success: true });
        });
    });
};
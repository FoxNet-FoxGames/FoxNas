const fs = require('fs');
const path = require('path');
const ROOT_PATH = path.join(__dirname, '..', '..'); 

module.exports = function(app) {
    app.get('/api/stream', (req, res) => {
        let relativePath = req.query.path;
        if (!relativePath) return res.status(400).send('Pfad fehlt');

        // Bereinigen: Führende Slashes entfernen
        relativePath = relativePath.replace(/^[\\/]+/, '');
        const fullPath = path.resolve(ROOT_PATH, relativePath);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).send(`Datei nicht gefunden. Server suchte unter: ${fullPath}`);
        }

        const stat = fs.statSync(fullPath);
        const fileSize = stat.size;
        const range = req.headers.range;
        const ext = path.extname(fullPath).toLowerCase();
        const fileName = path.basename(fullPath);

const mimeMap = {
    '.mp4': 'video/mp4', '.mkv': 'video/x-matroska', '.webm': 'video/webm',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.html': 'text/html',
    '.txt': 'text/plain', '.js': 'application/javascript', '.bat': 'text/plain'
};

        const contentType = mimeMap[ext] || 'application/octet-stream';

        // Header für Download-Manager (FDM) und Browser-Player
        const headers = {
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'Content-Length': fileSize,
            // Hilft FDM, den Dateinamen und Typ sofort zu erkennen
            'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`
        };

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(fullPath, {start, end});
            
            res.writeHead(206, {
                ...headers,
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Content-Length': chunksize,
            });
            file.pipe(res);
        } else {
            res.writeHead(200, headers);
            fs.createReadStream(fullPath).pipe(res);
        }
    });
};
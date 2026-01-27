const mm = require('music-metadata');
const path = require('path');
const fs = require('fs');

// ROOT_DRIVE muss exakt so definiert sein wie in deiner files.js
const ROOT_DRIVE = path.resolve(__dirname, '../..');

module.exports = (app) => {
    app.get('/api/audio-info', async (req, res) => {
        try {
            const relPath = req.query.path;
            const absPath = path.join(ROOT_DRIVE, relPath);

            if (!fs.existsSync(absPath)) return res.status(404).send('Audio nicht gefunden');

            const metadata = await mm.parseFile(absPath);
            const stats = fs.statSync(absPath);
            
            // Cover-Suche im selben Ordner
            const dir = path.dirname(absPath);
            const files = fs.readdirSync(dir);
            const coverFile = files.find(f => 
                f.toLowerCase().includes('cover') || 
                /\.(jpg|jpeg|png)$/i.test(f)
            );

            res.json({
                title: metadata.common.title || path.basename(absPath),
                artist: metadata.common.artist || 'Unbekannter Künstler',
                album: metadata.common.album || 'Unbekanntes Album',
                bitrate: Math.round(metadata.format.bitrate / 1000) + ' kbps',
                sampleRate: (metadata.format.sampleRate / 1000) + ' kHz',
                channels: metadata.format.numberOfChannels === 2 ? 'Stereo' : 'Mono',
                size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                format: metadata.format.container,
                cover: coverFile ? `/api/stream?path=${encodeURIComponent(path.join(path.dirname(relPath), coverFile))}` : null
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
};
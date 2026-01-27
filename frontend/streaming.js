const mm = require('music-metadata');
const path = require('path');
const fs = require('fs');

module.exports = (app) => {
    app.get('/api/audio-info', async (req, res) => {
        const audioPath = path.resolve(__dirname, '../..', req.query.path);
        try {
            const metadata = await mm.parseFile(audioPath);
            const stats = fs.statSync(audioPath);
            
            // Cover-Suche: cover.jpg, cover.png oder erstes Bild im Ordner
            const dir = path.dirname(audioPath);
            const files = fs.readdirSync(dir);
            let cover = files.find(f => f.toLowerCase().startsWith('cover')) || 
                        files.find(f => /\.(jpg|jpeg|png|gif)$/i.test(f));

            res.json({
                format: metadata.format.container,
                bitrate: Math.round(metadata.format.bitrate / 1000) + ' kbps',
                sampleRate: (metadata.format.sampleRate / 1000) + ' kHz',
                channels: metadata.format.numberOfChannels === 2 ? 'Stereo' : 'Mono',
                size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                title: metadata.common.title || path.basename(audioPath),
                artist: metadata.common.artist || 'Unknown Artist',
                cover: cover ? `/api/raw?path=${encodeURIComponent(path.join(path.relative(path.resolve(__dirname, '../..'), dir), cover))}` : null
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
};
const fs = require('fs');
const path = require('path');

// Die gleiche Pfad-Logik wie in files.js, um Sicherheit und Korrektheit zu garantieren
const ROOT_DRIVE = path.resolve(__dirname, '../..');

function joinToRoot(relPath) {
    const safePath = path.normalize(relPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const abs = path.join(ROOT_DRIVE, safePath);
    if (!abs.startsWith(ROOT_DRIVE)) throw new Error('Pfad-Verletzung');
    return abs;
}

/**
 * Verarbeitet das Verschieben von Dateien (Cut & Paste)
 */
async function handlePaste(req, res) {
    const { sourceFolder, targetFolder, files } = req.body;

    if (sourceFolder === undefined || targetFolder === undefined || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: 'Ungültige Parameter' });
    }

    if (sourceFolder === targetFolder) {
        return res.json({ success: true, message: 'Identischer Ordner.' });
    }

    try {
        for (const fileName of files) {
            // Pfade über joinToRoot auflösen
            const oldPath = joinToRoot(path.join(sourceFolder, fileName));
            const newPath = joinToRoot(path.join(targetFolder, fileName));

            // Falls Ziel bereits existiert: Standardmäßig überschreiben oder Error fangen
            // fs.renameSync verschiebt Dateien und ganze Ordner effizient
            fs.renameSync(oldPath, newPath);
        }

        res.json({ success: true, message: `${files.length} Objekte verschoben.` });
    } catch (err) {
        console.error('copypaste: Paste Error:', err);
        res.status(500).json({ error: 'Verschieben fehlgeschlagen: ' + err.message });
    }
}

module.exports = { handlePaste };
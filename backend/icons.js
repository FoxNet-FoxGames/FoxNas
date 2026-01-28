const fs = require('fs');
const path = require('path');

const ICON_DIR = path.resolve(__dirname, '../icons');
const loggedMessages = new Set();

module.exports = (app) => {
    app.get('/api/icon', (req, res) => {
        try {
            const { name, isDirectory } = req.query;
            let iconFile = 'file.svg';

            if (isDirectory === 'true') {
                iconFile = 'folder.svg';
            } else if (name) {
                const parts = name.split('.');
                // Wenn kein Punkt da ist oder Datei mit Punkt beginnt (ohne Endung danach)
                const hasExtension = parts.length > 1 && parts[0] !== '';
                let ext = hasExtension ? parts.pop().toLowerCase() : 'none';

                // Spezial-Mapping für Icons, die sich eine SVG teilen
                const extensionMap = {
                    'rar': 'rar.svg',
                    '7z': 'zip.svg',
                    'zip': 'zip.svg',
                    'tar': 'zip.svg',
                    'gz': 'zip.svg'
                };

                if (ext === 'none') {
                    iconFile = 'none.svg';
                } else {
                    iconFile = extensionMap[ext] || `${ext}.svg`;
                }
            }

            let iconPath = path.join(ICON_DIR, iconFile);

            // Prüfen, ob das spezifische Icon existiert
            if (fs.existsSync(iconPath)) {
                if (!loggedMessages.has(`success_${iconFile}`)) {
                    console.log(`\x1b[32m[Icon]\x1b[0m ${iconFile} geladen.`);
                    loggedMessages.add(`success_${iconFile}`);
                }
                res.sendFile(iconPath);
            } else {
                // Wenn das Icon nicht existiert -> Fallback auf file.svg
                if (!loggedMessages.has(`error_${iconFile}`)) {
                    console.log(`\x1b[31m[Error]\x1b[0m "${iconFile}" nicht gefunden, nutze file.svg`);
                    loggedMessages.add(`error_${iconFile}`);
                }
                res.sendFile(path.join(ICON_DIR, 'file.svg'));
            }
        } catch (err) {
            console.error("Icon API Error:", err);
            res.status(500).send("Icon Error");
        }
    });
};
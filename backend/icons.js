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
                const ext = parts.length > 1 ? parts.pop().toLowerCase() : 'file';
                iconFile = `${ext}.svg`;
            }

            const iconPath = path.join(ICON_DIR, iconFile);

            if (fs.existsSync(iconPath)) {
                if (!loggedMessages.has(`success_${iconFile}`)) {
                    console.log(`\x1b[32m[Icon]\x1b[0m ${iconFile} geladen.`);
                    loggedMessages.add(`success_${iconFile}`);
                }
                res.sendFile(iconPath);
            } else {
                if (!loggedMessages.has(`error_${iconFile}`)) {
                    console.log(`\x1b[31m[Error]\x1b[0m "${iconFile}" nicht gefunden, nutze file.svg`);
                    loggedMessages.add(`error_${iconFile}`);
                }
                res.sendFile(path.join(ICON_DIR, 'file.svg'));
            }
        } catch (err) {
            res.status(500).send("Icon Error");
        }
    });
};
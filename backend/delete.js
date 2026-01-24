const fs = require('fs');
const path = require('path');
const ROOT_DRIVE = path.resolve(__dirname, '../..');
const TRASH_DIR = path.join('.trash');

if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR, { recursive: true });
}

// Hilfsfunktion für das Format: "24 (Samstag) 01 (Januar) 2026 17:52:53"
function getFormattedDate() {
    const now = new Date();
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const dayNum = String(now.getDate()).padStart(2, '0');
    const dayName = days[now.getDay()];
    const monthNum = String(now.getMonth() + 1).padStart(2, '0');
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const time = now.toTimeString().split(' ')[0];

    return `${dayNum} (${dayName}) ${monthNum} (${monthName}) ${year} ${time}`;
}

function joinToRoot(relPath) {
    const safePath = path.normalize(relPath || '').replace(/^(\.\.(\/|\\|$))+/, '');
    const abs = path.join(ROOT_DRIVE, safePath);
    if (!abs.startsWith(ROOT_DRIVE)) throw new Error('Pfad-Verletzung');
    return abs;
}

module.exports = (app) => {
    app.post('/api/delete', async (req, res) => {
        // Wir erwarten 'username' jetzt im Body vom Frontend
        const { files, dir, permanent, username } = req.body;
        const activeUser = username || 'Unbekannt';

        if (!files || !Array.isArray(files)) {
            return res.status(400).json({ error: 'Keine Dateien ausgewählt' });
        }

        try {
            const formattedDate = getFormattedDate();
            
            for (const fileName of files) {
                const sourcePath = joinToRoot(path.join(dir, fileName));
                const actionText = permanent ? 'Löschte' : 'Papierkorbte';

                if (permanent) {
                    fs.rmSync(sourcePath, { recursive: true, force: true });
                } else {
                    // Dateiname im Papierkorb mit dem gewünschten Format (leicht bereinigt für Dateisystem-Kompatibilität)
                    const fileTimestamp = formattedDate.replace(/[:]/g, '-'); 
                    const trashPath = path.join(TRASH_DIR, `[${fileTimestamp}]_${fileName}`);
                    fs.renameSync(sourcePath, trashPath);
                }

                // Konsolen-Log im gewünschten Format
                console.log(`delete: \x1b[31m[LOG]\x1b[0m ${activeUser} ${actionText} ${formattedDate} - ${fileName}`);
            }

            res.json({ success: true, message: permanent ? 'Gelöscht' : 'Papierkorb' });
        } catch (err) {
            console.error('Delete Error:', err);
            res.status(500).json({ error: err.message });
        }
    });
};
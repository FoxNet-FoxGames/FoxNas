const fs = require('fs');
const path = require('path');

// Lädt die Berechtigungen für einen spezifischen User
function getPermissions(username) {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json'), 'utf8'));
    const user = users.find(u => u.user === username);
    
    if (!user) return null;

    // Standard-Berechtigungen falls Felder in der JSON fehlen
    return {
        admin: user.admin || false,
        canEditRoot: user.caneditroot || false,
        upload: user.upload || false,
        download: user.download || false,
        view: user.view || false,
        rename: user.rename !== undefined ? user.rename : (user.admin || false),
        delete: user.delete !== undefined ? user.delete : (user.admin || false),
        monitoring: user.monitoring !== undefined ? user.monitoring : (user.admin || false),
        blacklist: user.blacklist || [] 
    };
}

// Die zentrale Check-Funktion
function can(user, action, targetPath = "") {
    const p = getPermissions(user);
    if (!p) return false;

    // 1. Admin Override: Darf alles, außer Blacklist-Pfad-Checks (Sicherheit geht vor)
    if (p.admin) {
        // Optionale Ausnahme: Selbst Admins könnten von Blacklist betroffen sein, 
        // falls man Pfade wie "System32" komplett schützen will.
        if (targetPath && isBlacklisted(targetPath, p.blacklist)) return false;
        return true;
    }

    // 2. Blacklist Check (Gilt für alle Nicht-Admins)
    if (targetPath && isBlacklisted(targetPath, p.blacklist)) {
        return false; 
    }

    // 3. Action Check
    switch (action) {
        case 'VIEW': return p.view;
        case 'DOWNLOAD': return p.download;
        case 'UPLOAD': return p.upload;
        case 'RENAME': return p.rename;
        case 'DELETE': return p.delete;
        case 'MONITORING': return p.monitoring;
        case 'EDIT_ROOT': return p.canEditRoot;
        default: return false;
    }
}

// Hilfsfunktion für Pfad-Blacklisting
function isBlacklisted(targetPath, blacklist) {
    // Normalisiere Pfad für den Vergleich
    const normalizedTarget = path.normalize(targetPath).toLowerCase();
    return blacklist.some(entry => {
        const normalizedEntry = path.normalize(entry).toLowerCase();
        return normalizedTarget.startsWith(normalizedEntry);
    });
}

module.exports = { can, getPermissions };
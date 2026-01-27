const fs = require('fs');
const path = require('path');

const USER_DIR = path.join(__dirname, '..', 'user');

function getPermissions(username) {
    try {
        const userPath = path.join(USER_DIR, `${username}.json`);
        if (!fs.existsSync(userPath)) return null;
        
        const user = JSON.parse(fs.readFileSync(userPath, 'utf8'));

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
    } catch (e) {
        return null;
    }
}

function can(username, action, targetPath = "") {
    const p = getPermissions(username);
    if (!p) return false;

    // Admin Override (außer Blacklist)
    if (p.admin) {
        if (targetPath && isBlacklisted(targetPath, p.blacklist)) return false;
        return true;
    }

    // Blacklist Check
    if (targetPath && isBlacklisted(targetPath, p.blacklist)) return false;

    // Action Check
    const actions = {
        'VIEW': p.view,
        'DOWNLOAD': p.download,
        'UPLOAD': p.upload,
        'RENAME': p.rename,
        'DELETE': p.delete,
        'MONITORING': p.monitoring,
        'EDIT_ROOT': p.canEditRoot
    };

    return actions[action] || false;
}

function isBlacklisted(targetPath, blacklist) {
    const normalizedTarget = path.normalize(targetPath).toLowerCase();
    return blacklist.some(entry => {
        const normalizedEntry = path.normalize(entry).toLowerCase();
        // Verhindert Zugriff auf den Pfad selbst und alle Unterordner
        return normalizedTarget === normalizedEntry || normalizedTarget.startsWith(normalizedEntry + path.sep);
    });
}

module.exports = { can, getPermissions };
/**
 * FOXNAS Backend Auth Manager
 * Synchronisiert Berechtigungen mit den User-JSONs
 */
const AuthManager = {
    // Schützt die Route: Ist überhaupt jemand eingeloggt?
    sessionGuard: (req, res, next) => {
        if (!req.session || !req.session.user || !req.session.user.config) {
            return res.status(401).json({ error: 'TERMINAL_ACCESS_DENIED: Please login.' });
        }

        // Wir extrahieren die Daten aus der Session-Config
        const c = req.session.user.config;

        // Wir hängen ein sauberes User-Objekt an 'req', damit andere Scripte damit arbeiten können
        req.user = {
            user: c.user,
            name: c.name,
            isAdmin: c.admin === true,
            canUpload: c.upload === true,
            canDelete: c.delete === true,
            canRename: c.rename === true,
            blacklist: c.blacklist || []
        };

        next();
    },

    // Spezielle Middleware für Schreibzugriffe
    canWrite: (req, res, next) => {
        if (req.user.isAdmin || req.user.canUpload) {
            return next();
        }
        
        console.error(`AuthManager: [SECURITY] Blocked write attempt by: ${req.user.user}`);
        res.status(403).json({ error: 'FORBIDDEN: No write permissions.' });
    }
};

module.exports = AuthManager;
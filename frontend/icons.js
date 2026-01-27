/**
 * FOXNAS Smart Icon Logic
 */
function getIcon(item, currentDir = '') {
    // 1. Ordner-Check
    if (item.isDirectory) return '/api/icon?name=folder&isDirectory=true';

    const name = item.name.toLowerCase();
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico'];
    const ext = name.split('.').pop();

    // 2. BILDER: Thumbnail-Logik
    if (imageExtensions.includes(ext)) {
        // WICHTIG: Wenn currentDir fehlt, versuchen wir es aus dem Item-Pfad zu holen
        let folderPath = currentDir || (item.path ? item.path.substring(0, item.path.lastIndexOf('\\')) : '');
        
        // Wir bauen den Pfad EXAKT wie in deinem alten funktionierenden Script
        // Backslashes für Windows-Kompatibilität
        let fullPath = folderPath ? (folderPath + '\\' + item.name) : item.name;

        // Falls der Pfad mit einem Backslash beginnt, den das Backend nicht mag:
        fullPath = fullPath.replace(/^\\+/, ''); 

        return `/api/stream?path=${encodeURIComponent(fullPath)}`;
    }

    // 3. Alle anderen Dateien -> Neon SVG API
    return `/api/icon?name=${encodeURIComponent(item.name)}&isDirectory=false`;
}
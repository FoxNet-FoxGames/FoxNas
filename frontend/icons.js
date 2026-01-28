/**
 * FOXNAS Smart Icon Logic
 */
function getIcon(item, currentDir = '') {
    if (!item) return '/api/icon?name=none&isDirectory=false';

    // 1. Ordner-Check
    if (item.isDirectory) return '/api/icon?name=folder&isDirectory=true';

    const name = item.name;
    const parts = name.split('.');
    
    // Prüfen, ob eine echte Endung existiert (nicht nur ein Punkt am Anfang)
    const hasExtension = parts.length > 1 && parts[0] !== '';
    const ext = hasExtension ? parts.pop().toLowerCase() : 'none';
    
    // Bilder & SVGs direkt rendern
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'svg'];

    if (imageExtensions.includes(ext) && ext !== 'none') {
        let fullPath = currentDir ? (currentDir + '\\' + name) : name;
        fullPath = fullPath.replace(/\\\\/g, '\\').replace(/^\\+/, ''); 

        return `/api/stream?path=${encodeURIComponent(fullPath)}`;
    }

    // 2. Neon-Icon Fallback (jetzt mit korrekter Erkennung für "none")
    // Wir übergeben den Namen; das Backend entscheidet dann basierend auf der Endung oder "none"
    return `/api/icon?name=${encodeURIComponent(name)}&isDirectory=false`;
}
/**
 * FOXNAS Viewing & Streaming Module
 * @param {string} name - Dateiname
 * @param {boolean} isSelectionOnly - Nur für Sidebar (hier ignoriert)
 * @param {boolean} isEditMode - Wenn true (Alt+Enter), wird der Editor erzwungen
 */
async function handlePreview(name, isSelectionOnly = false, isEditMode = false) {
    if (isSelectionOnly) return;

    const ext = name.split('.').pop().toLowerCase();
    const fullFilePath = currentDir ? (currentDir + '\\' + name) : name;
    const streamUrl = `/api/stream?path=${encodeURIComponent(fullFilePath)}`;

    // 1. Bilder
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
        window.open(streamUrl, '_blank');
        return;
    } 

    // 2. Medien (Video & Audio)
    if (['mp4', 'webm', 'mkv', 'mp3', 'wav', 'ogg'].includes(ext)) {
        window.open(`videostream.html?path=${encodeURIComponent(fullFilePath)}`, '_blank');
        return;
    } 
    
    // 3. HTML Spezial-Logik
    if (ext === 'html') {
        if (isEditMode) {
            // Mit Alt+Enter: Editor
            window.open(`texteditor.html?path=${encodeURIComponent(fullFilePath)}`, '_blank');
        } else {
            // Nur Enter: Normales Streaming/Anzeigen
            window.open(streamUrl, '_blank');
        }
        return;
    }
    
    // 4. Andere Text- & Code-Dateien (immer Editor)
    if (['txt', 'js', 'css', 'json', 'log', 'md', 'py', 'php'].includes(ext)) {
        window.open(`texteditor.html?path=${encodeURIComponent(fullFilePath)}`, '_blank');
        return;
    }
    
    // Fallback
    window.open(streamUrl, '_blank');
}
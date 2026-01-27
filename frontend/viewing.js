/**
 * FOXNAS Viewing & Streaming Module - FIXED
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

    // 2. Video Player
    if (['mp4', 'webm', 'mkv'].includes(ext)) {
        window.open(`FoxPlayer.Video.html?path=${encodeURIComponent(fullFilePath)}`, '_blank');
        return;
    }

    // 3. Audio Player
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
        window.open(`FoxPlayer.Audio.html?path=${encodeURIComponent(fullFilePath)}`, '_blank');
        return;
    }

    // 4. HTML Spezial-Logik
    if (ext === 'html') {
        if (isEditMode) {
            window.open(`FoxIDE.html?path=${encodeURIComponent(fullFilePath)}`, '_blank');
        } else {
            window.open(streamUrl, '_blank');
        }
        return;
    }

    // 5. Code & Text
    if (['txt', 'js', 'css', 'json', 'log', 'md', 'py', 'php', 'bat'].includes(ext)) {
        window.open(`FoxIDE.html?path=${encodeURIComponent(fullFilePath)}`, '_blank');
        return;
    }

    // Fallback: Direkter Stream / Download
    window.open(streamUrl, '_blank');
}
function getIcon(item) {
    if (item.isDirectory) return '/icons/folder.png';
    
    const parts = item.name.split('.');
    if (parts.length === 1) return '/icons/file.png'; 
    const ext = parts.pop().toLowerCase();
    
    // BILDER: Direkt das Bild als Icon verwenden
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) {
        // Nutzt den gleichen Endpunkt wie handlePreview
        return `/api/stream?path=${encodeURIComponent(currentDir + '\\' + item.name)}`;
    }

    const icons = {
        'txt': 'txt.png', 'js': 'js.png', 'html': 'html.png', 'exe': 'exe.png', 'bat': 'bat.png',
        'mp3': 'audio.mp3.png', 'wav': 'audio.wav.png', 'mid': 'audio.mid.png', 'midi': 'audio.mid.png'
    };
    
    if (icons[ext]) return '/icons/' + icons[ext];

    if (['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(ext)) return '/icons/video.png';
    if (['ogg', 'flac', 'm4a'].includes(ext)) return '/icons/audio.png';
    
    return '/icons/file.png'; 
}
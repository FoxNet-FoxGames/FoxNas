/**
 * FOXNAS Video-Streaming Keybinds (Custom Player)
 */
let lastEscTime = 0;

window.addEventListener('keydown', (e) => {
    const video = document.getElementById('mainVideo');
    const wrapper = document.getElementById('playerWrapper');
    if (!video) return;

    // Dynamische Keys aus den Settings holen
    const customFwd = document.getElementById('kb_fwd').value;
    const customBwd = document.getElementById('kb_bwd').value;

    const key = e.key.toLowerCase();

    // --- DOWNLOAD STREAM (STRG + S) ---
    if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        const videoPath = params.get('path');
        if (videoPath) {
            const downloadUrl = `/api/download?path=${encodeURIComponent(videoPath)}`;
            window.location.assign(downloadUrl);
        }
        return;
    }

    // --- FULLSCREEN & EXIT (ESC LOGIK) ---
    if (e.key === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            const now = Date.now();
            if (now - lastEscTime < 500) {
                window.close(); 
            }
            lastEscTime = now;
        }
        return;
    }

    // --- FULLSCREEN TOGGLE (F) ---
    if (key === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // --- MUTE (M) ---
    if (key === 'm') {
        e.preventDefault();
        video.muted = !video.muted;
    }

    // --- NAVIGATION (Inkl. dynamischer Keybinds) ---
    if (e.key === customFwd || e.key === 'ArrowRight') { e.preventDefault(); video.currentTime += 3; }
    if (e.key === customBwd || e.key === 'ArrowLeft')  { e.preventDefault(); video.currentTime -= 3; }
    if (key === 'l') { video.currentTime += 10; }
    if (key === 'j') { video.currentTime -= 10; }

    // --- PLAY / PAUSE ---
    if (e.key === ' ' || key === 'k') {
        e.preventDefault();
        video.paused ? video.play() : video.pause();
    }

    // --- FRAME BY FRAME (Punkt & Komma) ---
    if (e.key === '.') { 
        video.pause();
        video.currentTime += 1 / 30; 
    }
    if (e.key === ',') { 
        video.pause();
        video.currentTime -= 1 / 30;
    }
});
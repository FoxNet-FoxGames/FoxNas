/**
 * FOXNAS Global Media Keybinds (Video & Audio)
 */
window.addEventListener('keydown', (e) => {
    // Erkennt automatisch ob Video oder Audio Element vorhanden ist
    const media = document.getElementById('mainVideo') || document.getElementById('audioElement');
    if (!media) return;

    const key = e.key.toLowerCase();
    
    // Default-Aktionen verhindern (z.B. Leertaste scrollt)
    if (key === ' ' || key === 'arrowup' || key === 'arrowdown') {
        e.preventDefault();
    }

    switch(key) {
        case ' ':
        case 'k':
            media.paused ? media.play() : media.pause();
            break;
        case 'f':
            // Fullscreen nur beim Video-Player sinnvoll oder Visualizer Wrapper
            const wrapper = document.getElementById('playerWrapper') || document.querySelector('.audio-container');
            if (wrapper) {
                if (!document.fullscreenElement) {
                    wrapper.requestFullscreen().catch(err => console.log(err));
                } else {
                    document.exitFullscreen();
                }
            }
            break;
        case 'm':
            media.muted = !media.muted;
            break;
        case 'arrowright':
        case 'l':
            media.currentTime += (key === 'l' ? 10 : 3);
            break;
        case 'arrowleft':
        case 'j':
            media.currentTime -= (key === 'j' ? 10 : 3);
            break;
        case '.': // Frame vorwärts (nur Video sinnvoll, aber schadet Audio nicht)
            media.currentTime += 1/30;
            break;
        case ',': // Frame rückwärts
            media.currentTime -= 1/30;
            break;
        case 'escape':
            // Fenster schließen bei Doppel-Esc
            const now = Date.now();
            if (window.lastEsc && (now - window.lastEsc < 500)) {
                window.close();
            }
            window.lastEsc = now;
            break;
    }
});
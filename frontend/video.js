/**
 * FOXNAS Video Logic v1.01
 */

const video = document.getElementById('mainVideo');
const stretchCheck = document.getElementById('stretchCheck');
const settingsPanel = document.getElementById('settingsPanel');

// Initialisierung
const params = new URLSearchParams(window.location.search);
const videoPath = params.get('path');

if(videoPath) {
    video.src = `/api/stream?path=${encodeURIComponent(videoPath)}`;
    document.getElementById('videoTitle').innerText = videoPath.split('\\').pop();
}

// STRETCH LOGIK
function toggleStretch() {
    if(stretchCheck.checked) {
        // Full Stretch (verzerrt falls nötig, füllt aber alles aus)
        video.style.objectFit = "fill";
    } else {
        // Proportional (standard)
        video.style.objectFit = "contain";
    }
}

function toggleSettingsPanel() {
    settingsPanel.style.display = settingsPanel.style.display === 'flex' ? 'none' : 'flex';
}

// Maus verstecken
let idleTimer;
window.addEventListener('mousemove', () => {
    const wrapper = document.getElementById('playerWrapper');
    if (!wrapper) return;

    wrapper.classList.remove('hide-cursor');
    clearTimeout(idleTimer);
    
    idleTimer = setTimeout(() => {
        wrapper.classList.add('hide-cursor');
    }, 2000);
});

// Progress
video.addEventListener('timeupdate', () => {
    const pc = (video.currentTime / video.duration) * 100;
    document.getElementById('progBar').style.width = pc + "%";
    document.getElementById('videoTime').innerText = formatTime(video.currentTime) + " / " + formatTime(video.duration);
});

function formatTime(seconds) {
    if (!seconds) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return (h > 0 ? h + ":" : "") + m.toString().padStart(2, '0') + ":" + s.toString().padStart(2, '0');
}

// SETTINGS LADEN/SPEICHERN (Simuliert über API Pfad)
async function saveSettings() {
    const config = {
        keybinds: {
            fwd: document.getElementById('kb_fwd').value,
            bwd: document.getElementById('kb_bwd').value
        },
        video: {
            stretch: stretchCheck.checked
        }
    };

    try {
        const response = await fetch('/api/save-config', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ config })
        });
        if(response.ok) alert("SETTINGS_SAVED_TO_CONFIG");
    } catch(e) {
        console.error("Save failed, using local storage fallback");
        localStorage.setItem('foxnas_video_cfg', JSON.stringify(config));
    }
}
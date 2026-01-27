/**
 * FOXNAS Audio Engine & Logic
 */
const audio = document.getElementById('audioElement');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const path = params.get('path');

let audioCtx, analyser, source, filters = [];
const frequencies = [60, 300, 1000, 4000, 16000];

async function init() {
    // 1. Metadaten laden
    const res = await fetch(`/api/audio-info?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    
    document.getElementById('trackTitle').innerText = data.title;
    document.getElementById('trackArtist').innerText = data.artist;
    document.getElementById('s_freq').innerText = data.sampleRate;
    document.getElementById('s_rate').innerText = data.bitrate;
    document.getElementById('s_mode').innerText = data.channels;
    document.getElementById('s_size').innerText = data.size;
    if(data.cover) document.getElementById('coverArt').style.backgroundImage = `url('${data.cover}')`;

    audio.src = `/api/stream?path=${encodeURIComponent(path)}`;

    // 2. User Settings laden (für EQ)
    loadUserConfig();
}

function setupAudioEngine() {
    if (audioCtx) return; // Nur einmal initialisieren

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createMediaElementSource(audio);
    
    // EQ Filter Chain bauen
    let lastNode = source;
    filters = frequencies.map(f => {
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = f;
        filter.Q.value = 1;
        filter.gain.value = 0;
        lastNode.connect(filter);
        lastNode = filter;
        return filter;
    });

    analyser = audioCtx.createAnalyser();
    lastNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;

    setupVisualizer();
    audio.play();
}

function setupVisualizer() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            // FoxNas Cyan-Blue Gradient
            ctx.fillStyle = `rgb(0, ${dataArray[i] + 100}, 255)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    draw();
}

// EQ Steuerung
function updateEQ(index, value) {
    if (filters[index]) {
        filters[index].gain.value = value;
    }
}

async function savePlayerConfig() {
    const username = localStorage.getItem('foxnas_user'); // Muss beim Login gesetzt worden sein
    const eqGains = filters.map(f => f.gain.value);

    await fetch('/api/player/config', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            username, 
            config: { eq: eqGains } 
        })
    });
}

async function loadUserConfig() {
    // Hier ziehen wir die Daten aus dem User-Objekt (muss in der API implementiert sein)
    const user = JSON.parse(localStorage.getItem('foxnas_user_obj'));
    if (user && user.foxplayer && user.foxplayer.eq) {
        user.foxplayer.eq.forEach((val, i) => {
            const slider = document.querySelector(`.eq-slider[data-index="${i}"]`);
            if (slider) {
                slider.value = val;
                if (filters[i]) filters[i].gain.value = val;
            }
        });
    }
}

// Progress & Time
audio.ontimeupdate = () => {
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progFill').style.width = pct + "%";
    document.getElementById('timeDisplay').innerText = format(audio.currentTime) + " / " + format(audio.duration);
};

document.getElementById('progWrap').onclick = (e) => {
    const rect = document.getElementById('progWrap').getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * audio.duration;
};

function format(s) {
    if (!s) return "00:00";
    const m = Math.floor(s/60);
    return m.toString().padStart(2,'0') + ":" + Math.floor(s%60).toString().padStart(2,'0');
}

// Start-Trigger (Wegen Browser-Autoplay-Sperre)
window.addEventListener('click', () => {
    setupAudioEngine();
}, { once: true });

init();
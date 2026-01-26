function initSystem() {
    setInterval(updateStats, 2000);
    setInterval(() => { 
        document.getElementById('clock').innerText = new Date().toLocaleTimeString(); 
    }, 1000);
    // Falls refresh existiert (explorer.js)
    if (typeof refresh === 'function') refresh('');
}

async function updateStats() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        // Sprache abrufen (Shortcut)
        const lang = LanguageEngine.dict.monitoring;

        // CPU & RAM
        document.getElementById('cpuVal').innerText = data.cpu + '%';
        document.getElementById('cpuBar').style.width = data.cpu + '%';
        document.getElementById('ramVal').innerText = data.ram.percent + '%';
        document.getElementById('ramBar').style.width = data.ram.percent + '%';
        document.getElementById('ramDetails').innerText = `${data.ram.usedGB} / ${data.ram.totalGB} GB`;
        
        // STORAGE
        if (data.disk) {
            const total = data.disk.totalGB || 1000;
            const free = data.disk.freeGB || 0;
            const used = data.disk.usedGB !== undefined ? data.disk.usedGB : (total - free);

            // 1. Gesamtkapazität
            if (document.getElementById('diskTotal')) {
                document.getElementById('diskTotal').innerText = total >= 1024 
                    ? (total / 1024).toFixed(1) + ' TB' 
                    : total + ' GB';
            }
            
            // 2. Belegter Speicher (Nutzt jetzt JSON: "used" / "vollgemüllt")
            document.getElementById('diskInfo').innerText = `${used} GB ${lang.belegt}`;
            
            // 3. Freier Speicher (Nutzt jetzt JSON: "free" / "noch Platz für...")
            if (document.getElementById('diskRemaining')) {
                document.getElementById('diskRemaining').innerText = `${free} GB ${lang.frei}`;
            }
            
            // 4. Anzeigeleiste
            document.getElementById('diskBar').style.width = data.disk.usedPercent + '%';
        }
    } catch (e) {
        console.error("SYSTEM: Error updating stats", e);
    }
}

function switchTab(id, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    btn.classList.add('active');
}
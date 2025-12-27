/**
 * FOXNAS Ping Module
 * Misst die Latenz zwischen Client und Server
 */

async function updatePing() {
    const pingDisplay = document.getElementById('pingVal');
    if (!pingDisplay) return;

    const start = performance.now();
    try {
        // Wir fragen eine minimale Route an
        const response = await fetch('/api/ping', { cache: 'no-store' });
        
        if (response.ok) {
            const end = performance.now();
            const latency = Math.round(end - start);
            
            pingDisplay.innerText = latency;
            
            // Optional: Farbe basierend auf Latenz anpassen
            if (latency > 150) {
                pingDisplay.style.color = 'var(--accent)'; // Rot/Orange bei hohem Ping
            } else {
                pingDisplay.style.color = 'var(--primary)'; // Grün bei gutem Ping
            }
        }
    } catch (err) {
        pingDisplay.innerText = 'ERR';
    }
}

// Intervall starten: Alle 3 Sekunden pingen
setInterval(updatePing, 3000);

// Initialer Aufruf
updatePing();
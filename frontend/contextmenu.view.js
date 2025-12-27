/**
 * FOXNAS View & Preferences Module
 * Steuerung für das VIEW-Menü und User-Einstellungen
 */

/**
 * Öffnet/Schließt das View-Popup
 */
function toggleViewMenu(e) {
    if (e) e.stopPropagation(); 
    const panel = document.getElementById('viewPanel');
    if (!panel) return;
    
    const isVisible = panel.style.display === 'flex';
    panel.style.display = isVisible ? 'none' : 'flex';
}

/**
 * Globaler Click-Listener zum Schließen des Menüs bei Klicks außerhalb
 */
window.addEventListener('click', (e) => {
    const panel = document.getElementById('viewPanel');
    const viewBtn = document.querySelector('button[onclick*="toggleViewMenu"]');
    
    if (panel && panel.style.display === 'flex') {
        // Schließen, wenn der Klick weder das Panel noch den Button getroffen hat
        if (!panel.contains(e.target) && e.target !== viewBtn) {
            panel.style.display = 'none';
        }
    }
});

/**
 * Schaltet den Glitch-Effekt um und speichert die Wahl im Account
 */
async function toggleGlitch() {
    // 1. UI sofort umschalten (Visual Feedback)
    const isNowDisabled = document.body.classList.toggle('no-glitch');
    const newState = !isNowDisabled; // true = Effekt AN, false = Effekt AUS
    
    // 2. Button Text aktualisieren
    updateGlitchButtonUI(newState);

    // 3. Im Backend permanent speichern
    try {
        const response = await fetch('/api/update-user-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                updates: { glitcheffect: newState } 
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log(`SYSTEM: Glitch-Präferenz (${newState}) permanent gespeichert.`);
            // Lokale Session-Daten im Frontend synchronisieren
            if (window.currentUser && window.currentUser.config) {
                window.currentUser.config.glitcheffect = newState;
            }
        }
    } catch (err) {
        console.error("SYSTEM ERROR: Konnte Glitch-Einstellung nicht speichern", err);
    }
}

/**
 * Aktualisiert nur den Text des Buttons im Menü
 */
function updateGlitchButtonUI(isActive) {
    const btn = document.getElementById('toggleGlitchBtn');
    if (btn) {
        btn.innerText = `Glitch: ${isActive ? 'AN' : 'AUS'}`;
        // Optional: Farbe des Buttons ändern
        btn.style.color = isActive ? 'var(--primary)' : 'var(--accent)';
    }
}

/**
 * Wendet die geladenen User-Einstellungen an (wird nach Login/Check-Auth aufgerufen)
 * @param {Object} config - Das Config-Objekt des Users aus der config.json
 */
function applyPreferences(config) {
    if (!config) return;

    // Glitch-Effekt anwenden
    // Wenn glitcheffect explizit false ist, Effekt ausschalten
    if (config.glitcheffect === false) {
        document.body.classList.add('no-glitch');
        updateGlitchButtonUI(false);
    } else {
        document.body.classList.remove('no-glitch');
        updateGlitchButtonUI(true);
    }

    console.log("SYSTEM: User-Präferenzen angewendet.");
}

// Falls das Skript neu geladen wird und bereits User-Daten da sind:
if (window.currentUser && window.currentUser.config) {
    applyPreferences(window.currentUser.config);
}

    // Initialisierung nach dem Laden
    window.onload = () => {
        if(typeof initKeybinds === 'function') initKeybinds();
        if(typeof initContextMenu === 'function') initContextMenu();
    };
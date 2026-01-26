/**
 * FOXNAS View & Preferences Module - Multilanguage Update
 */

function toggleViewMenu(e) {
    if (e) e.stopPropagation(); 
    const panel = document.getElementById('viewPanel');
    if (!panel) return;
    const isVisible = panel.style.display === 'flex';
    panel.style.display = isVisible ? 'none' : 'flex';
}

/**
 * Schaltet den Glitch-Effekt um
 */
async function toggleGlitch() {
    const isNowDisabled = document.body.classList.toggle('no-glitch');
    const newState = !isNowDisabled; 
    
    updateGlitchButtonUI(newState);

    try {
        await fetch('/api/update-user-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: { glitcheffect: newState } })
        });
        if (window.currentUser && window.currentUser.config) {
            window.currentUser.config.glitcheffect = newState;
        }
    } catch (err) {
        console.error("SYSTEM ERROR: Save failed", err);
    }
}

/**
 * Zieht die Texte für den Glitch-Button aus der JSON
 */
function updateGlitchButtonUI(isActive) {
    const btn = document.getElementById('toggleGlitchBtn');
    const lang = LanguageEngine.dict.explorer; // Zugriff auf explorer.glitch_on / glitch_off

    if (btn && lang) {
        btn.innerText = isActive ? lang.glitch_on : lang.glitch_off;
        btn.style.color = isActive ? 'var(--primary)' : 'var(--accent)';
    }
}

/**
 * Wendet die gesamten View-Übersetzungen an
 */
function applyViewLanguage() {
    const lang = LanguageEngine.dict.explorer;
    if (!lang) return;

    // Alle View-Sektions-Titel übersetzen
    const titles = document.querySelectorAll('.view-section .view-title');
    if (titles.length >= 3) {
        titles[0].innerText = lang.sort_title;
        titles[1].innerText = lang.layout_title;
        titles[2].innerText = lang.system_title;
    }

    // Buttons im View-Menü
    const viewButtons = document.querySelectorAll('.view-section button');
    // Die Reihenfolge muss deiner HTML entsprechen:
    // 0:Name, 1:Größe, 2:Datum, 3:Standard, 4:Block
    if (viewButtons.length >= 5) {
        viewButtons[0].innerText = lang.sort_name;
        viewButtons[1].innerText = lang.sort_size;
        viewButtons[2].innerText = lang.sort_date;
        viewButtons[3].innerText = lang.layout_std;
        viewButtons[4].innerText = lang.layout_block;
    }
}

function applyPreferences(config) {
    if (!config) return;
    const isActive = config.glitcheffect !== false;
    
    if (!isActive) document.body.classList.add('no-glitch');
    else document.body.classList.remove('no-glitch');
    
    applyViewLanguage(); // Statische Texte laden
    updateGlitchButtonUI(isActive); // Button-Status laden
}

window.onload = () => {
    if(typeof initKeybinds === 'function') initKeybinds();
    if(typeof initContextMenu === 'function') initContextMenu();
    applyViewLanguage(); 
};
document.addEventListener('languageReady', () => {
    console.log("VIEW: Sprache empfangen, beschrifte Menü...");
    applyViewLanguage(); 
    
    // Falls ein User eingeloggt ist, den Button-Status korrekt beschriften
    if (window.currentUser && window.currentUser.config) {
        updateGlitchButtonUI(window.currentUser.config.glitcheffect !== false);
    }
});
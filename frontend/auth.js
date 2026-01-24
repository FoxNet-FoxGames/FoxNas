/**
 * FOXNAS Authentication & UI Initialization
 */

let authLogoutTimer = null;
let authTimeLeft = 60;

let escLogoutTimer = null;
let escCountdown = 3;
let logoutWarningActive = false;

window.addEventListener('load', () => {
    checkExistingAuth();
});

async function handleLogin() {
    const userEl = document.getElementById('user');
    const passEl = document.getElementById('pass');
    const errEl = document.getElementById('loginErr');
    if(!userEl || !passEl) return;
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user: userEl.value, pass: passEl.value })
        });
        const data = await res.json();
        if(data.success) setupUserInterface(data);
        else if(errEl) errEl.style.display = 'block';
    } catch (e) { console.error("Login Error:", e); }
}

async function checkExistingAuth() {
    try {
        const res = await fetch('/api/check-auth');
        const data = await res.json();
        if (data.success) setupUserInterface(data);
    } catch (e) { console.log("Keine Session vorhanden."); }
}

function setupUserInterface(data) {
    window.currentUser = data.config.user;
    window.permissions = data.config;

    // UI Elemente umschalten
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainHeader').style.display = 'grid';
    document.getElementById('mainTabs').style.display = 'flex';
    document.getElementById('mainUI').style.display = 'grid';
    
    // Header Profil-Bereich füllen
    const headerProfile = document.getElementById('headerProfileArea');
    if (headerProfile) {
        headerProfile.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; margin-right: 15px;">
                <span id="autoLogoutTimer" style="color: white; font-family: 'JetBrains Mono'; font-size: 0.8rem;">01:00</span>
                <span style="font-size: 0.5rem; color: rgba(255,255,255,0.4); letter-spacing: 1px;">DOUBLE [ESC] TO TERMINATE</span>
            </div>
            <span style="color:var(--primary);margin-right:15px;font-family:'Orbitron'">[ ${window.permissions.name} ]</span> 
            <div style="font-size: 0.7rem;"><span id="pingVal">--</span>ms</div>`;
    }

    // Modal Profildaten setzen
    const profName = document.getElementById('profileDisplayName');
    const profID = document.getElementById('profileFullID');
    const profImg = document.getElementById('profileImg');
    if(profName) profName.innerText = window.permissions.name;
    if(profID) profID.innerText = window.currentUser;
    if(profImg) profImg.src = `/user/${window.currentUser}.png`;

    // --- INITIALISIERUNG ALLER MODULE ---
    
    // 1. Explorer & Daten
    if (typeof refresh === 'function') refresh(""); 
    if (typeof renderQuickPaths === 'function') renderQuickPaths(data.quickpaths);
    
    // 2. Interaktion & Anzeige (HIER steckt die Bild-Vorschau drin)
    if (typeof initViewing === 'function') initViewing(); 
    
    // 3. System-Dienste (CPU/RAM/Logs)
    if (typeof initSystem === 'function') initSystem();
    
    // 4. Steuerung (Tastatur & Kontextmenü)
    if (typeof initKeybinds === 'function') initKeybinds();
    if (typeof initContextMenu === 'function') initContextMenu();
    
    initLogoutKeyEvents();
    startInactivityTimer();
}

function startInactivityTimer() {
    resetLogoutTimer();
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => 
        window.addEventListener(evt, resetLogoutTimer)
    );

    if (authLogoutTimer) clearInterval(authLogoutTimer);
    authLogoutTimer = setInterval(() => {
        authTimeLeft--;
        const timerDisplay = document.getElementById('autoLogoutTimer');
        if (timerDisplay) {
            let mins = Math.floor(authTimeLeft / 60);
            let secs = authTimeLeft % 60;
            timerDisplay.innerText = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
            
            timerDisplay.classList.remove('blink-slow', 'blink-critical');
            if (authTimeLeft > 10) timerDisplay.style.color = 'white';
            else if (authTimeLeft <= 10 && authTimeLeft > 5) timerDisplay.style.color = 'var(--accent)';
            else if (authTimeLeft <= 5 && authTimeLeft > 3) {
                timerDisplay.style.color = 'var(--accent)';
                timerDisplay.classList.add('blink-slow');
            } else if (authTimeLeft <= 3 && authTimeLeft > 0) {
                timerDisplay.style.color = 'var(--accent)';
                timerDisplay.classList.add('blink-critical');
            }
        }
        if (authTimeLeft <= 0) performLogout();
    }, 1000);
}

function resetLogoutTimer() { 
    if(!logoutWarningActive) authTimeLeft = 60; 
}

// --- ESC LOGOUT LOGIK ---
function initLogoutKeyEvents() {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Falls Viewer offen, Logout ignorieren (Viewer schließt sich meist selbst via keybinds.js)
            const viewer = document.getElementById('fileViewer');
            if (viewer && viewer.style.display !== 'none') return; 

            if (!logoutWarningActive) activateEscLogout();
            else performLogout();
        } else if (logoutWarningActive) {
            cancelEscLogout();
        }
    });
    window.addEventListener('mousedown', () => {
        if (logoutWarningActive) cancelEscLogout();
    });
}

function activateEscLogout() {
    logoutWarningActive = true;
    escCountdown = 3;
    
    const warningEl = document.getElementById('logoutWarning');
    const screenFrame = document.getElementById('screenFrame');
    const countDisplay = document.getElementById('terminationCountdown');

    if(warningEl) warningEl.style.display = 'flex';
    if(countDisplay) countDisplay.innerText = escCountdown;
    
    if(screenFrame) {
        screenFrame.classList.add('critical-warning');
        screenFrame.style.opacity = "1";
    }

    escLogoutTimer = setInterval(() => {
        if (escCountdown <= 0) {
            clearInterval(escLogoutTimer);
            performLogout();
            return;
        }
        escCountdown--;
        if(countDisplay) countDisplay.innerText = escCountdown;
    }, 1000);
}

function cancelEscLogout() {
    logoutWarningActive = false;
    clearInterval(escLogoutTimer);
    
    document.getElementById('logoutWarning').style.display = 'none';
    const screenFrame = document.getElementById('screenFrame');
    if(screenFrame) {
        screenFrame.classList.remove('critical-warning');
        screenFrame.style.opacity = "0";
        screenFrame.style.boxShadow = "none";
    }
    resetLogoutTimer();
}

async function performLogout() {
    if (authLogoutTimer) clearInterval(authLogoutTimer);
    if (escLogoutTimer) clearInterval(escLogoutTimer);
    try { await fetch('/api/logout', { method: 'POST' }); } catch (e) { console.error("Logout Fehler"); }
    location.reload(); 
}

window.handleLogout = performLogout;
window.handleLogin = handleLogin;
/**
 * FOXNAS Identity & Profile Manager
 */
const FoxLogger = {
    // Schaltet das Modal an/aus
    toggleProfileModal() {
        const modal = document.getElementById('profileModal');
        if (!modal) return;

        if (modal.style.display === 'none' || modal.style.display === '') {
            this.renderDetails();
            modal.style.display = 'flex';
            console.log("%c[SYSTEM] Profile Modal Opened", "color: #00f2ff");
        } else {
            modal.style.display = 'none';
        }
    },

    // Baut den Inhalt dynamisch zusammen
    renderDetails() {
        const details = document.getElementById('profileDetails');
        if (!details) return;

        const p = window.permissions || { name: "GAST", role: "NONE", blockedPaths: ["SYSTEM_ROOT"] };
        const path = (typeof currentDir !== 'undefined') ? currentDir : '/';

        details.innerHTML = `
            <div class="profile-row" style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding:5px 0;">
                <span style="opacity:0.6">USER:</span>
                <span style="color:var(--primary); font-weight:bold;">${p.name}</span>
            </div>
            <div class="profile-row" style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding:5px 0;">
                <span style="opacity:0.6">ROLE:</span>
                <span style="color:var(--primary); font-weight:bold;">${p.role ? p.role.toUpperCase() : 'USER'}</span>
            </div>
            <div class="profile-row" style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding:5px 0;">
                <span style="opacity:0.6">LOCATION:</span>
                <span style="color:var(--primary); font-weight:bold;">${path}</span>
            </div>
            <div style="margin-top:15px;">
                <span style="font-size:0.6rem; opacity:0.6;">BLOCKED_SECTORS:</span><br>
                <span style="color:var(--accent); font-size:0.7rem; font-family:'JetBrains Mono';">
                    ${p.blockedPaths ? p.blockedPaths.join(', ') : 'NONE'}
                </span>
            </div>
        `;
    },

    init() {
        // Initialer Log in der Konsole beim Start
        console.log("%c FOXNAS v1.0.3 - Identity System Ready ", "background: #222; color: #00ff41; font-weight: bold;");
    }
};
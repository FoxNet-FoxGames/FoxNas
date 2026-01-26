/**
 * FoxNas Language Engine
 */
const LanguageEngine = {
    currentLang: localStorage.getItem('foxnas_lang') || 'de_de',
    dict: {},

    async init() {
        await this.loadLanguage(this.currentLang);
        this.applyTexts();
        document.dispatchEvent(new CustomEvent('languageReady', { detail: this.dict }));
    },

    async loadLanguage(lang) {
        try {
            const response = await fetch(`language/FoxNas/${lang}.json`);
            this.dict = await response.json();
            this.currentLang = lang;
            localStorage.setItem('foxnas_lang', lang);
        } catch (err) {
            console.error("Sprachdatei konnte nicht geladen werden:", err);
        }
    },

    // Diese Funktion sucht Elemente per ID oder Selektor und setzt den Text
    applyTexts() {
        if (!this.dict.login) return;

        // Login Screen
        document.querySelector('#loginScreen h2').innerText = this.dict.login.title;
        document.getElementById('user').placeholder = this.dict.login.user_placeholder;
        document.getElementById('pass').placeholder = this.dict.login.pass_placeholder;
        document.querySelector('#loginScreen .cta').innerText = this.dict.login.btn_auth;
        document.getElementById('loginErr').innerText = this.dict.login.err_msg;

        // Tabs
        document.getElementById('tab-btn-desktop').innerText = this.dict.tabs.desktop;
        document.getElementById('tab-btn-explorer').innerText = this.dict.tabs.explorer;

        // Monitoring
        document.querySelector('#monitoringPanel .panel-header').innerText = this.dict.monitoring.header;
        
        // Explorer
        document.querySelector('.btn-action').innerText = this.dict.explorer.btn_view;
        // ... hier können weitere IDs ergänzt werden
        
        // Context Menu (wird oft dynamisch gerendert, daher Funktion anpassen)
        const ctx = document.getElementById('contextMenu');
        if(ctx) {
            ctx.children[0].innerText = this.dict.context.rename;
            ctx.children[1].innerText = this.dict.context.delete;
            ctx.children[2].innerText = this.dict.context.download;
            ctx.children[3].innerText = this.dict.context.download_zip;
        }

        console.log(`Language applied: ${this.currentLang}`);
    },

    setLanguage(lang) {
        this.loadLanguage(lang).then(() => {
            location.reload(); // Seite neu laden, um alle Instanzen zu aktualisieren
        });
    }
};

function toggleLangMenu() {
    const menu = document.getElementById('langSelectorContainer');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Erweitere deine LanguageEngine.setLanguage Methode:
const originalSetLanguage = LanguageEngine.setLanguage;
LanguageEngine.setLanguage = function(lang) {
    document.getElementById('langSelectorContainer').style.display = 'none';
    
    // Rufe die ursprüngliche Ladelogik auf
    this.loadLanguage(lang).then(() => {
        location.reload(); 
    });
};

// Schließen, wenn man außerhalb klickt
window.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.language-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('langSelectorContainer').style.display = 'none';
    }
});

// Initialisierung beim Laden
document.addEventListener('DOMContentLoaded', () => LanguageEngine.init());

// Globale Funktion für den Button
function language() {
    const lang = prompt("Sprache wählen / Choose language (de_de, en_us):", LanguageEngine.currentLang);
    if (lang && lang !== LanguageEngine.currentLang) {
        LanguageEngine.setLanguage(lang);
    }
}
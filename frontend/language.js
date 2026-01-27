/**
 * FoxNas Language Engine
 */
const LanguageEngine = {
    currentLang: localStorage.getItem('foxnas_lang') || null,
    dict: {},

    async init() {
        // 1. Browser-Sprache ermitteln und loggen
        const browserLang = navigator.language || navigator.userLanguage; // z.B. "en-US"
        const mappedLang = this.mapBrowserLangToFoxNas(browserLang);

        console.log(`Browser language detected: "${browserLang}". Mapped FoxNas language would be: "${mappedLang}".`);

        // 2. Nur anwenden, wenn noch keine manuelle Auswahl existiert
        if (!this.currentLang) {
            this.currentLang = mappedLang;
            localStorage.setItem('foxnas_lang', this.currentLang);
        }

        // 3. Sprache laden und Texte anwenden
        await this.loadLanguage(this.currentLang);
        this.applyTexts();

        document.dispatchEvent(new CustomEvent('languageReady', { detail: this.dict }));
    },

    mapBrowserLangToFoxNas(lang) {
        const mapping = {
            'de': 'de_de',
            'de-de': 'de_de',
            'en': 'en_us',
            'en-us': 'en_us',
            'en-gb': 'en_us',
            'fr': 'fr_fr',
            'fr-fr': 'fr_fr',
            'es': 'es_es',
            'es-es': 'es_es',
            'it': 'it_it',
            'it-it': 'it_it',
            'ru': 'ru_ru',
            'ru-ru': 'ru_ru',
            'pl': 'pl_pl',
            'pl-pl': 'pl_pl',
            'tr': 'tr_tr',
            'tr-tr': 'tr_tr',
            'pt': 'pt_br',
            'pt-br': 'pt_br',
            'cs': 'cs_cz',
            'cs-cz': 'cs_cz',
            'ko': 'ko_kr',
            'ko-kr': 'ko_kr',
            'ja': 'ja_jp',
            'ja-jp': 'ja_jp',
            'zh': 'zh_cn',
            'zh-cn': 'zh_cn'
        };
        lang = lang.toLowerCase();
        return mapping[lang] || 'en_us';
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

        // Context Menu
        const ctx = document.getElementById('contextMenu');
        if (ctx) {
            ctx.children[0].innerText = this.dict.context.rename;
            ctx.children[1].innerText = this.dict.context.delete;
            ctx.children[2].innerText = this.dict.context.download;
            ctx.children[3].innerText = this.dict.context.download_zip;
        }

        console.log(`Language applied: ${this.currentLang}`);
    },

    setLanguage(lang) {
        this.loadLanguage(lang).then(() => location.reload());
    }
};

// Toggle Menü
function toggleLangMenu() {
    const menu = document.getElementById('langSelectorContainer');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Override, um Menü zu schließen
const originalSetLanguage = LanguageEngine.setLanguage;
LanguageEngine.setLanguage = function(lang) {
    document.getElementById('langSelectorContainer').style.display = 'none';
    this.loadLanguage(lang).then(() => location.reload());
};

// Schließen, wenn Klick außerhalb
window.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.language-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('langSelectorContainer').style.display = 'none';
    }
});

// Initialisierung beim Laden
document.addEventListener('DOMContentLoaded', () => LanguageEngine.init());

// Globale Funktion für Prompt-Auswahl
function language() {
    const lang = prompt("Sprache wählen / Choose language (de_de, en_us):", LanguageEngine.currentLang);
    if (lang && lang !== LanguageEngine.currentLang) {
        LanguageEngine.setLanguage(lang);
    }
}

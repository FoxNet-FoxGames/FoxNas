function toggleLangMenu() {
    const menu = document.getElementById('langSelectorContainer');
    if (menu.style.display === "none") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

function selectLanguage(element) {
    const langValue = element.getAttribute('data-value');
    
    // 1. Deine bestehende Engine aufrufen
    if (typeof LanguageEngine !== 'undefined') {
        LanguageEngine.setLanguage(langValue);
    } else {
        console.log("Gewählte Sprache:", langValue);
    }

    // 2. Menü nach Auswahl schließen
    document.getElementById('langSelectorContainer').style.display = "none";
}

// Optional: Menü schließen, wenn man irgendwo anders hinklickt
window.onclick = function(event) {
    if (!event.target.matches('.btn-language') && !event.target.closest('.lang-selector-popup')) {
        document.getElementById('langSelectorContainer').style.display = "none";
    }
}
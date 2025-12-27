/**
 * FOXNAS Rechtsklick-Kontextmenü
 */

function initContextMenu() {
    window.addEventListener('contextmenu', (e) => {
        const item = e.target.closest('.file-item'); // Prüfe ob .file-item (oder .item)
        
        if (item) {
            e.preventDefault();
            
            // Auswahl-Logik
            const fileName = item.dataset.name;
            if (!selectedFiles.includes(fileName)) {
                selectedFiles = [fileName];
                if (typeof renderSelection === 'function') renderSelection();
            }
            
            const menu = document.getElementById('contextMenu');
            menu.style.display = 'block';
            menu.style.left = e.pageX + 'px';
            menu.style.top = e.pageY + 'px';
        } else {
            document.getElementById('contextMenu').style.display = 'none';
        }
    });

    window.addEventListener('click', () => {
        const menu = document.getElementById('contextMenu');
        if (menu) menu.style.display = 'none';
    });
}

// Deine restlichen Funktionen (ctxDelete, ctxRename, etc.) hier drunter belassen...
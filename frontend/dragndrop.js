/**
 * FOXNAS Drag & Drop Upload Module
 */

function initDragNDrop() {
    const explorer = document.getElementById('explorer');
    if (!explorer) return;

    // Verhindert Standard-Browser-Verhalten (Datei im Tab öffnen)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        explorer.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // Visuelles Feedback beim Drüberziehen
    explorer.addEventListener('dragover', (e) => {
        const target = e.target.closest('.file-item');
        // Entferne altes Highlight
        document.querySelectorAll('.drag-target').forEach(el => el.classList.remove('drag-target'));
        
        if (target && target.dataset.isDir === "true") {
            target.classList.add('drag-target');
        } else {
            explorer.classList.add('drag-active');
        }
    });

    explorer.addEventListener('dragleave', () => {
        explorer.classList.remove('drag-active');
        document.querySelectorAll('.drag-target').forEach(el => el.classList.remove('drag-target'));
    });

    explorer.addEventListener('drop', (e) => {
        explorer.classList.remove('drag-active');
        const target = e.target.closest('.file-item');
        let uploadPath = currentDir;

        // Falls auf einen Ordner gedroppt wurde, diesen Pfad nehmen
        if (target && target.dataset.isDir === "true") {
            const folderName = target.dataset.name;
            uploadPath = currentDir + (currentDir ? '\\' : '') + folderName;
            target.classList.remove('drag-target');
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files, uploadPath);
        }
    });
}

async function handleFileUpload(files, path) {
    console.log(`[UPLOAD] Starte Upload von ${files.length} Datei(en) nach: ${path}`);
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // WICHTIG: Pfad wird als Query-Parameter 'dir' übergeben
            const res = await fetch(`/api/upload?dir=${encodeURIComponent(path)}`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                console.log(`[SUCCESS] ${file.name} hochgeladen.`);
            } else {
                console.error(`[ERROR] Upload fehlgeschlagen für ${file.name}`);
            }
        } catch (err) {
            console.error("Upload Netzwerkfehler:", err);
        }
    }
    
    // Explorer aktualisieren, wenn alle Uploads durch sind
    refresh(currentDir);
}

// Initialisierung
document.addEventListener('DOMContentLoaded', initDragNDrop);
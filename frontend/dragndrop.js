/**
 * FOXNAS Drag & Drop & Upload Manager
 */

const UploadManager = {
    // Schaltet das UI-Fenster ein/aus
    showUI(visible) {
        const ui = document.getElementById('uploadManager');
        if (ui) ui.style.display = visible ? 'block' : 'none';
    },

    async startUpload(files, uploadPath) {
        console.log(`[SYSTEM] Initialisiere Transfer: ${files.length} Dateien.`);
        this.showUI(true);
        
        const bar = document.getElementById('uploadBar');
        const countTxt = document.getElementById('uploadCount');
        const nameTxt = document.getElementById('uploadFileName');
        const percentTxt = document.getElementById('uploadPercent');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            countTxt.innerText = `${i + 1}/${files.length}`;
            nameTxt.innerText = file.name.toUpperCase();
            
            await this.performXHR(file, uploadPath, (percent) => {
                bar.style.width = percent + '%';
                percentTxt.innerText = percent + '%';
            });
        }

        // Fertigstellung
        nameTxt.innerText = "TRANSFER COMPLETE";
        setTimeout(() => {
            this.showUI(false);
            if (typeof refresh === 'function') refresh(currentDir);
        }, 1500);
    },

    performXHR(file, path, progressCallback) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', file);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    progressCallback(percent);
                }
            });

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) resolve();
                    else {
                        const response = JSON.parse(xhr.responseText || "{}");
                        alert(`ACCESS_DENIED: ${response.error || 'Server Error'}`);
                        resolve(); // Weitermachen trotz Fehler
                    }
                }
            };

            xhr.open('POST', `/api/upload?dir=${encodeURIComponent(path)}`, true);
            xhr.send(formData);
        });
    }
};

function initDragNDrop() {
    const explorer = document.getElementById('explorer');
    if (!explorer) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        explorer.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    explorer.addEventListener('dragover', (e) => {
        const target = e.target.closest('.file-item');
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

        if (target && target.dataset.isDir === "true") {
            const folderName = target.dataset.name;
            uploadPath = currentDir + (currentDir ? '/' : '') + folderName;
            target.classList.remove('drag-target');
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            UploadManager.startUpload(files, uploadPath);
        }
    });
}

document.addEventListener('DOMContentLoaded', initDragNDrop);
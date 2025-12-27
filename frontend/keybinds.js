/**
 * FOXNAS Keybinds & Interaction Module
 */

let searchString = "";
let searchTimeout = null;
let lastEscTime = 0; 
let keybindsInitialized = false; 

// Zentrale Zwischenablage
let clipboard = {
    files: [],
    sourceFolder: "",
    mode: null // "cut"
};

function initKeybinds() {
    if (keybindsInitialized) return;
    
    const explorer = document.getElementById('explorer');
    const box = document.getElementById('selectionBox');

    // --- MAUS LOGIK ---
    explorer.addEventListener('mousedown', (e) => {
        const fileItem = e.target.closest('.file-item');
        const nameLabel = e.target.closest('.file-name');

        // Umbenennen durch Klick auf Label (nur wenn bereits selektiert)
        if (nameLabel && fileItem && selectedFiles.includes(fileItem.dataset.name) && selectedFiles.length === 1) {
            e.preventDefault();
            e.stopPropagation();
            startRename(fileItem);
            return;
        }

        if (e.button !== 0 || fileItem) return;
        dragStart = { x: e.clientX, y: e.clientY };
        box.style.display = 'block';
        if (!e.ctrlKey) { 
            selectedFiles = []; 
            renderSelection(); 
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!dragStart) return;
        const left = Math.min(dragStart.x, e.clientX);
        const top = Math.min(dragStart.y, e.clientY);
        const width = Math.abs(dragStart.x - e.clientX);
        const height = Math.abs(dragStart.y - e.clientY);
        
        box.style.left = left + 'px'; 
        box.style.top = top + 'px';
        box.style.width = width + 'px'; 
        box.style.height = height + 'px';

        document.querySelectorAll('.file-item').forEach(item => {
            const rect = item.getBoundingClientRect();
            const overlap = !(rect.right < left || rect.left > left + width || rect.bottom < top || rect.top > top + height);
            
            if (overlap && !selectedFiles.includes(item.dataset.name)) {
                selectedFiles.push(item.dataset.name);
            }
        });
        renderSelection();
    });

    window.addEventListener('mouseup', () => { 
        dragStart = null; 
        box.style.display = 'none'; 
    });

    // --- TASTATUR LOGIK ---
    window.addEventListener('keydown', async (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'F2') {
            if (selectedFiles.length === 1) {
                const itemEl = document.querySelector(`.file-item[data-name="${CSS.escape(selectedFiles[0])}"]`);
                if (itemEl) startRename(itemEl);
            }
        }

        if (e.key === 'Escape') {
            const currentTime = Date.now();
            if (currentTime - lastEscTime < 500) {
                if (typeof handleLogout === 'function') handleLogout();
            }
            lastEscTime = currentTime;
            clipboard.files = [];
            clipboard.mode = null;
            renderSelection();
            return;
        }

        if (e.key === 'Delete') {
            if (selectedFiles.length > 0) {
                executeDelete(e.shiftKey);
            }
        }

        if (e.ctrlKey && e.key.toLowerCase() === 'x') {
            if (selectedFiles.length > 0) {
                clipboard.files = [...selectedFiles];
                clipboard.sourceFolder = currentDir;
                clipboard.mode = 'cut';
                renderSelection();
            }
        }

        if (e.ctrlKey && e.key.toLowerCase() === 'v') {
            if (clipboard.mode === 'cut' && clipboard.files.length > 0) {
                executePaste();
            }
        }

        const items = Array.from(document.querySelectorAll('.file-item'));
        if (items.length === 0) return;

        let currentIndex = items.findIndex(el => el.dataset.name === selectedFiles[selectedFiles.length - 1]);

        if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            let newIndex = currentIndex;
            const cols = Math.floor(explorer.offsetWidth / 135) || 1;

            if (e.key === 'ArrowRight') newIndex++;
            else if (e.key === 'ArrowLeft') newIndex--;
            else if (e.key === 'ArrowDown') newIndex += cols;
            else if (e.key === 'ArrowUp') newIndex -= cols;

            if (newIndex < 0) newIndex = 0;
            if (newIndex >= items.length) newIndex = items.length - 1;

            if (newIndex !== currentIndex) {
                const target = items[newIndex];
                selectFile(target.dataset.name, newIndex, { ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
                target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            goUp();
        }

if (e.key === 'Enter' && selectedFiles.length > 0) {
    e.preventDefault();
    const lastFile = selectedFiles[selectedFiles.length - 1];
    const itemEl = items.find(el => el.dataset.name === lastFile);
    if (itemEl) {
        const isDir = itemEl.dataset.isDir === "true";
        if (e.shiftKey) {
            isDir ? downloadAsZip(lastFile) : downloadFileDirect(lastFile);
        } else {
            if (isDir) {
                refresh(currentDir + (currentDir ? '\\' : '') + lastFile);
            } else {
                // HIER DIE ÄNDERUNG:
                // Wir geben e.altKey als dritten Parameter mit
                handlePreview(lastFile, false, e.altKey);
            }
        }
    }
}

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
            searchString += e.key.toLowerCase();
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => { searchString = ""; }, 1000);

            const match = items.find(el => el.dataset.name.toLowerCase().startsWith(searchString));
            if (match) {
                selectFile(match.dataset.name, items.indexOf(match), { ctrlKey: false, shiftKey: false });
                match.scrollIntoView({ block: 'nearest' });
            }
        }
    });

    keybindsInitialized = true;
}

function startRename(itemEl) {
    // Geändert von .file-name auf .name
    const nameEl = itemEl.querySelector('.file-name');
    
    if (!nameEl) return;

    const oldName = itemEl.dataset.name;
    const currentHTML = nameEl.innerHTML;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldName;
    // Wir geben ihm eine eigene Klasse für das Styling des Input-Felds
    input.className = 'rename-input';
    
    nameEl.innerHTML = '';
    nameEl.appendChild(input);
    input.focus();
    
    const lastDot = oldName.lastIndexOf('.');
    input.setSelectionRange(0, (lastDot > 0 && itemEl.dataset.isDir !== "true") ? lastDot : oldName.length);

    const finish = async () => {
        const newName = input.value.trim();
        if (newName && newName !== oldName) {
            try {
                const res = await fetch('/api/rename', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dir: currentDir, oldName, newName })
                });
                if (res.ok) {
                    itemEl.dataset.name = newName;
                    nameEl.textContent = newName;
                } else {
                    nameEl.innerHTML = currentHTML;
                }
            } catch (err) { nameEl.innerHTML = currentHTML; }
        } else {
            nameEl.innerHTML = currentHTML;
        }
        if (typeof refresh === 'function') refresh(currentDir);
    };

    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); finish(); }
        if (e.key === 'Escape') { input.removeEventListener('blur', finish); nameEl.innerHTML = currentHTML; }
    });
}

async function executeDelete(permanent) {
    const filesToDelete = [...selectedFiles];
    filesToDelete.forEach(name => {
        const el = document.querySelector(`.file-item[data-name="${CSS.escape(name)}"]`);
        if (el) el.style.display = 'none';
    });
    try {
        await fetch('/api/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: filesToDelete, dir: currentDir, permanent })
        });
        selectedFiles = [];
        refresh(currentDir);
    } catch (err) { refresh(currentDir); }
}

async function executePaste() {
    try {
        const res = await fetch('/api/paste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceFolder: clipboard.sourceFolder, targetFolder: currentDir, files: clipboard.files })
        });
        if (res.ok) {
            clipboard.files = [];
            clipboard.mode = null;
            refresh(currentDir);
        }
    } catch (err) { console.error(err); }
}

function selectFile(name, index, event) {
    if (event.ctrlKey) {
        selectedFiles.includes(name) ? selectedFiles = selectedFiles.filter(f => f !== name) : selectedFiles.push(name);
    } else if (event.shiftKey && lastSelectedIndex !== -1) {
        const allItems = Array.from(document.querySelectorAll('.file-item'));
        const start = Math.min(index, lastSelectedIndex);
        const end = Math.max(index, lastSelectedIndex);
        selectedFiles = allItems.slice(start, end + 1).map(el => el.dataset.name);
    } else { 
        selectedFiles = [name]; 
    }
    if (selectedFiles.length === 1) handlePreview(name, true); 
    lastSelectedIndex = index;
    renderSelection();
}

function renderSelection() {
    document.querySelectorAll('.file-item').forEach(el => {
        const isSelected = selectedFiles.includes(el.dataset.name);
        const isCutting = clipboard.mode === 'cut' && clipboard.files.includes(el.dataset.name) && clipboard.sourceFolder === currentDir;
        el.classList.toggle('selected', isSelected);
        el.style.opacity = isCutting ? "0.4" : "1";
        el.style.filter = isCutting ? "grayscale(1)" : "none";
    });
}

function downloadFileDirect(name) {
    window.location.assign(`/api/download?path=${encodeURIComponent(currentDir + '\\' + name)}`);
}

function downloadAsZip(name) {
    window.location.assign(`/api/download-folder?path=${encodeURIComponent(currentDir + '\\' + name)}`);
}
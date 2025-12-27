async function refresh(dir) {
    currentDir = dir;
    selectedFiles = []; 
    document.getElementById('pathDisplay').innerText = '/' + dir;
    const res = await fetch(`/api/list?dir=${encodeURIComponent(dir)}&user=${currentUser}`);
    const data = await res.json();
    lastServerData = data.entries; 
    renderExplorer();
}

function renderExplorer() {
    const explorer = document.getElementById('explorer');
    explorer.innerHTML = '';
    
    let items = lastServerData.filter(item => {
        if (item.isDirectory && !viewConfig.showFolders) return false;
        if (!item.isDirectory && !viewConfig.showFiles) return false;
        return true;
    });

    // Sorting Logik
    items.sort((a, b) => {
        if (viewConfig.layout === 'explorer') {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
        }
        let valA = a[viewConfig.sortBy];
        let valB = b[viewConfig.sortBy];
        if (typeof valA === 'string') return valA.localeCompare(valB) * viewConfig.sortOrder;
        return (valA - valB) * viewConfig.sortOrder;
    });

    items.forEach((item, idx) => explorer.appendChild(createFileItem(item, idx)));
}

function createFileItem(item, index) {
    const div = document.createElement('div');
    div.className = 'item file-item'; 
    div.dataset.name = item.name;
    div.dataset.index = index;
    div.dataset.isDir = item.isDirectory;
    
    div.innerHTML = `
        <img src="${getIcon(item)}" onerror="this.src='/icons/file.png'">
        <span class="file-name">${item.name}</span>
    `;
    
    div.onclick = (e) => { 
        e.stopPropagation(); 
        selectFile(item.name, index, e); 
    };

    // ÄNDERUNG HIER:
    div.ondblclick = (e) => {
        e.stopPropagation();
        if (item.isDirectory) {
            refresh(currentDir + (currentDir ? '\\' : '') + item.name);
        } else {
            // KEIN Download mehr, sondern Preview/Streaming
            handlePreview(item.name);
        }
    };
    return div;
}

function goUp() {
    const parts = currentDir.split('\\');
    if(parts.length > 0 && currentDir !== "") { parts.pop(); refresh(parts.join('\\')); }
}

function quickNav(path) {
    switchTab('explorer-tab', document.getElementById('tab-btn-explorer'));
    refresh(path);
}

function renderQuickPaths(paths) {
    const grid = document.getElementById('quickPathGrid');
    grid.innerHTML = '';
    paths.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'btn-action';
        btn.innerText = '/' + p.name;
        btn.onclick = () => quickNav(p.path);
        grid.appendChild(btn);
    });
}
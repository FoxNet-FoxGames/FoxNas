let viewConfig = {
    sortBy: 'name',
    sortOrder: 1,
    showFolders: true,
    showFiles: true,
    layout: 'explorer',
    hiddenExts: []
};

let currentUser = null;
let permissions = {};
let currentDir = '';
let selectedFiles = []; 
let lastSelectedIndex = -1;
let dragStart = null;
let lastServerData = [];

let logoutTimeLeft = 60;
let logoutTimerInterval = null;
let escPressCount = 0;
let escTimeout = null;
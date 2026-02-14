# FoxNas Copilot Instructions

## Architecture Overview
FoxNas is a Node.js-based personal cloud storage system with web UI. Server serves files from parent directory (`../..` from backend) for portability. Uses Express + Socket.IO for real-time features.

- **Backend**: Modular routes in `backend/` (e.g., `auth.js`, `files.js`). Each exports `(app) => {}` or special cases like `chat.js` with `(io)`.
- **Frontend**: Vanilla JS modules in `frontend/`. Globals in `globals.js`, no framework.
- **Auth**: Session-based, user configs as JSON in `user/`. Permissions: admin, upload, delete, rename.
- **File Ops**: Path traversal prevention via `joinToRoot()` normalizing paths. Root is `path.resolve(__dirname, '../..')`.
- **Streaming**: `/api/stream` with range headers for video/audio. MIME types mapped in `streaming.js`.
- **Chat**: Socket.IO broadcasts messages, logged in console with timestamps.
- **UI**: Neon theme (`#00ffff`, `#ff0055`), multi-language via JSON files in `language/FoxNas/`.

## Key Patterns
- **Path Handling**: Always use `joinToRoot(relPath)` to prevent `..` traversal. Example: `const abs = joinToRoot(dir);`.
- **Permissions**: Check `req.user.canWrite` or `req.user.isAdmin` in routes. Use `sessionGuard` and `canWrite` middleware.
- **Frontend Modules**: Load via `<script src="frontend/module.js">`. Use globals like `currentDir`, `selectedFiles`.
- **Icons**: Dynamic via `/api/icon?name=...&isDirectory=...`, fallback to file icon.
- **Sorting/Filtering**: In `renderExplorer()`, sort by `viewConfig.sortBy` (name/size), filter folders/files.
- **Events**: Custom events like `languageReady` for i18n updates.

## Workflows
- **Start**: `npm start` (runs `node server.js` on port 80, logs local IPs).
- **Dev**: `npm run dev` (nodemon for auto-restart).
- **Login**: Default `admin`/`fox`. User JSON: `{"user":"admin","pass":"fox","admin":true,"upload":true}`.
- **File Upload**: Multer to `ROOT_DRIVE + safeRelDir`, 10GB limit.
- **Debug**: Console logs with colors (e.g., `\x1b[32m[Loaded]\x1b[0m`).

## Conventions
- **Comments**: German in code, but UI multi-lang.
- **Errors**: Return JSON `{error: "msg"}` with status codes.
- **Sockets**: `io.emit('chatMessage', formattedMsg)` for broadcasts.
- **DOM Updates**: Direct manipulation, e.g., `document.getElementById('explorer').innerHTML = ''`.
- **Sounds**: Trigger via `console.log("MessageSend")` for audio cues.

Focus on secure path handling, session auth, and real-time features. Avoid frameworks; keep vanilla JS.
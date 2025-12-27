const si = require('systeminformation');
const checkDiskSpace = require('check-disk-space').default;
const path = require('path');

// ROOT_DRIVE zeigt auf das Hauptverzeichnis (eins höher als der Server-Ordner)
const ROOT_DRIVE = path.resolve(__dirname, '../..'); 

module.exports = (app) => {
    app.get('/api/status', async (req, res) => {
        try {
            // Parallele Abfrage aller Systemdaten
            const [cpu, mem, disk, net, fsStats] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                checkDiskSpace(ROOT_DRIVE),
                si.networkStats(),
                si.fsStats()
            ]);

            // Sicherheit: Falls Arrays leer sind, nehmen wir ein leeres Objekt als Fallback
            const network = (net && net.length > 0) ? net[0] : { rx_sec: 0, tx_sec: 0 };
            const storageIO = fsStats || { rx_sec: 0, wx_sec: 0 };

            res.json({
                // CPU Auslastung in %
                cpu: Math.round(cpu.currentLoad || 0),

                // RAM Details (GB und %)
                ram: {
                    percent: Math.round((mem.active / mem.total) * 100),
                    usedGB: (mem.active / 1024 / 1024 / 1024).toFixed(1),
                    totalGB: (mem.total / 1024 / 1024 / 1024).toFixed(1)
                },

                // Netzwerk (Konvertierung in KB/s)
                net: {
                    rx: Math.round((network.rx_sec || 0) / 1024), // Download
                    tx: Math.round((network.tx_sec || 0) / 1024)  // Upload
                },

                // Festplatten & Laufwerk Auslastung
                disk: {
                    freeGB: Math.round(disk.free / 1e9),
                    totalGB: Math.round(disk.size / 1e9),
                    usedPercent: Math.round(((disk.size - disk.free) / disk.size) * 100),
                    
                    // Aktuelle Schreib/Lese-Last des Laufwerks (Disk I/O) in KB/s
                    readIO: Math.round((storageIO.rx_sec || 0) / 1024),
                    writeIO: Math.round((storageIO.wx_sec || 0) / 1024)
                }
            });
        } catch (e) { 
            console.error("Status Error:", e.message);
            // Wenn gar nichts geht, sende Null-Werte zurück statt abzustürzen
            res.status(200).json({ 
                cpu: 0, 
                ram: { percent: 0, usedGB: 0, totalGB: 0 },
                net: { rx: 0, tx: 0 },
                disk: { freeGB: 0, totalGB: 0, usedPercent: 0, readIO: 0, writeIO: 0 }
            }); 
        }
    });
};
const si = require('systeminformation');
const checkDiskSpace = require('check-disk-space').default;
const path = require('path');

const ROOT_DRIVE = path.resolve(__dirname, '../..'); 

module.exports = (app) => {
    app.get('/api/status', async (req, res) => {
        try {
            const [cpu, mem, disk, net, fsStats] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                checkDiskSpace(ROOT_DRIVE),
                si.networkStats(),
                si.fsStats()
            ]);

            const network = (net && net.length > 0) ? net[0] : { rx_sec: 0, tx_sec: 0 };
            const storageIO = fsStats || { rx_sec: 0, wx_sec: 0 };
            const GB = 1024 * 1024 * 1024;

            res.json({
                cpu: Math.round(cpu.currentLoad || 0),
                ram: {
                    percent: Math.round((mem.active / mem.total) * 100),
                    usedGB: (mem.active / GB).toFixed(1),
                    totalGB: (mem.total / GB).toFixed(1)
                },
                net: {
                    rx: Math.round((network.rx_sec || 0) / 1024),
                    tx: Math.round((network.tx_sec || 0) / 1024)
                },
                disk: {
                    freeGB: Math.round(disk.free / GB),
                    totalGB: Math.round(disk.size / GB),
                    usedPercent: Math.round(((disk.size - disk.free) / disk.size) * 100),
                    readIO: Math.round((storageIO.rx_sec || 0) / 1024),
                    writeIO: Math.round((storageIO.wx_sec || 0) / 1024)
                }
            });
        } catch (e) { 
            console.error("Monitoring Error:", e.message);
            res.status(200).json({ cpu: 0, ram: {}, net: {}, disk: {} }); 
        }
    });
};
const path = require('path');

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'FoxNas.html'));
    });

    app.get('/api/ping', (req, res) => res.send('pong'));
};
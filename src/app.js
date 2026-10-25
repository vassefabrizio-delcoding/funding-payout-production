const express = require('express');
const path = require('path');
const platformRoutes = require('./routes/platform');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', platformRoutes);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[CORE] Server operativo in modalità PRODUZIONE REALE sulla porta ${PORT}`);
});
module.exports = app;
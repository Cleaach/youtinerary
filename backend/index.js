const express = require('express');

const app = express();
const PORT = 2200;

app.use(express.json()); 

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express API!' });
});

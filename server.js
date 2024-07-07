const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.port = 8000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

// http://localhost:8000/index.html
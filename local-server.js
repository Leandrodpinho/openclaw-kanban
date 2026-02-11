const app = require('./api/index');
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve static files locally (in Vercel production, this is handled by rewrites)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`OpenClaw Kanban (Local) running at http://localhost:${PORT}`);
});

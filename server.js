const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Office Add-ins
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Serve manifest.xml
app.get('/manifest.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'manifest.xml'));
});

// Serve taskpane
app.get('/src/taskpane/taskpane.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/taskpane/taskpane.html'));
});

// Serve configuration
app.get('/config/templates.json', (req, res) => {
    res.json(require('./config/templates.json'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create simple icon placeholders if they don't exist
const iconsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Start server
app.listen(PORT, () => {
    console.log(`
========================================
  Email Template Manager Add-in Server
========================================

Server running at: http://localhost:${PORT}
Manifest available at: http://localhost:${PORT}/manifest.xml

Next Steps:
1. Sideload the add-in in Outlook:
   - For Outlook on the web: https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/sideload-outlook-add-ins-for-testing
   - For Outlook desktop: Use the manifest file with the add-in deployment tool

2. Configure your templates in: config/templates.json

3. Update the BCC email and tracking domain in config/templates.json

========================================
    `);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});

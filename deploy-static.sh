#!/bin/bash

# Deploy Static - No Backend Server Required
# This script prepares your add-in for static hosting

echo "🚀 Preparing Outlook Add-in for Static Hosting..."

# Create deployment directory
mkdir -p static-deploy

# Copy essential files
echo "📦 Copying files..."
cp manifest.xml static-deploy/
cp -r src static-deploy/
cp -r config static-deploy/
cp -r assets static-deploy/ 2>/dev/null || echo "Note: assets folder not found (optional)"

# Copy documentation
cp README.md static-deploy/
cp INSTALLATION.md static-deploy/
cp CONFIGURATION.md static-deploy/
cp STATIC-HOSTING.md static-deploy/

# Create a simple index.html for root access
cat > static-deploy/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Outlook Email Template Manager</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #0078d4; }
        .box {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        code {
            background: #e1e1e1;
            padding: 2px 6px;
            border-radius: 3px;
        }
        a {
            color: #0078d4;
            text-decoration: none;
        }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>📧 Email Template Manager for Outlook</h1>

    <div class="box">
        <h2>Installation</h2>
        <p>To use this add-in in Outlook:</p>
        <ol>
            <li>Open Outlook (Web or Desktop)</li>
            <li>Go to Settings → Get Add-ins → My add-ins</li>
            <li>Click "Add from URL" (or "Add from file" for desktop)</li>
            <li>Enter: <code id="manifest-url"></code></li>
            <li>Click "OK" and start using templates!</li>
        </ol>
    </div>

    <div class="box">
        <h2>Quick Links</h2>
        <ul>
            <li><a href="manifest.xml">Download Manifest</a></li>
            <li><a href="src/taskpane/taskpane.html">View Add-in Interface</a></li>
            <li><a href="README.md">Documentation</a></li>
            <li><a href="INSTALLATION.md">Installation Guide</a></li>
            <li><a href="CONFIGURATION.md">Configuration Guide</a></li>
        </ul>
    </div>

    <div class="box">
        <h2>Features</h2>
        <ul>
            <li>✅ Pre-built templates for Sales, Support, HR, Marketing, Finance</li>
            <li>✅ Dynamic placeholder replacement</li>
            <li>✅ Automatic BCC tracking</li>
            <li>✅ Invisible tracking codes</li>
            <li>✅ Live preview</li>
            <li>✅ Works on Web & Desktop Outlook</li>
        </ul>
    </div>

    <script>
        // Set the manifest URL dynamically
        const manifestUrl = window.location.origin + '/manifest.xml';
        document.getElementById('manifest-url').textContent = manifestUrl;
    </script>
</body>
</html>
EOF

# Create a README for deployment
cat > static-deploy/DEPLOY.md << 'EOF'
# Deployment Instructions

This folder contains everything needed for static hosting.

## Option 1: Netlify (Easiest)

1. Go to https://app.netlify.com/drop
2. Drag this entire folder to the upload area
3. Wait for deployment
4. Copy the URL (e.g., https://your-app.netlify.app)
5. Update manifest.xml with your URL
6. Re-upload to Netlify
7. Load manifest in Outlook

## Option 2: GitHub Pages

1. Create a new repository on GitHub
2. Push this folder's contents to the repo
3. Go to Settings → Pages
4. Enable Pages from main branch
5. Your add-in will be at: https://username.github.io/repo-name

## Option 3: Vercel

```bash
npm i -g vercel
cd static-deploy
vercel
```

## Option 4: Any HTTP Server

For testing locally:

```bash
# Python
python -m http.server 3000

# Node.js
npx http-server -p 3000

# PHP
php -S localhost:3000
```

## Important: Update Manifest URLs

After deploying, update manifest.xml with your production URL:

Find and replace all instances of:
- `localhost:3000`

With your actual URL:
- `https://your-actual-url.com`

## No Backend Required!

This add-in works entirely client-side. No server, database, or API needed.
Just host these static files anywhere with HTTPS.
EOF

# Create .gitignore for deployment folder
cat > static-deploy/.gitignore << 'EOF'
node_modules/
.DS_Store
*.log
EOF

echo "✅ Static deployment files ready!"
echo ""
echo "📁 Location: ./static-deploy"
echo ""
echo "🎯 Next Steps:"
echo "1. cd static-deploy"
echo "2. Update manifest.xml URLs with your hosting URL"
echo "3. Deploy to:"
echo "   • Netlify: Drag folder to app.netlify.com/drop"
echo "   • GitHub Pages: Push to GitHub and enable Pages"
echo "   • Vercel: Run 'vercel' command"
echo ""
echo "📖 See DEPLOY.md in static-deploy/ for detailed instructions"
echo ""
echo "🌐 No server or backend required - works with pure static hosting!"

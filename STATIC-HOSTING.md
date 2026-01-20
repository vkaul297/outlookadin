# Static Hosting Guide - No Backend Required

This guide explains how to deploy the Outlook add-in using **pure static hosting** with no backend server.

## Why Static Hosting Works

The add-in is designed to work entirely client-side:
- ✅ All logic runs in the browser (JavaScript)
- ✅ Templates can be embedded inline or loaded from static JSON
- ✅ Office.js API handles all Outlook interactions
- ✅ No database or server-side processing needed
- ✅ BCC and tracking work through client-side APIs

The `server.js` file is only a **development convenience** - it just serves static files.

## Option 1: Inline Configuration (Zero Dependencies)

Embed your configuration directly in the HTML - no JSON file fetch needed.

### Step 1: Edit `src/taskpane/taskpane.html`

Add configuration in a script tag:

```html
<!-- Add before the closing </body> tag -->
<script type="application/json" id="config-data">
{
  "settings": {
    "bccEmail": "tracking@yourcompany.com",
    "trackingDomain": "track.yourcompany.com"
  },
  "templates": [
    {
      "id": "sales-intro",
      "jobFunction": "Sales",
      "name": "Sales Introduction",
      "subject": "Introduction - {{companyName}}",
      "body": "<p>Hi {{firstName}},</p><p>Your message...</p>",
      "trackingCode": "ST-INTRO"
    }
  ]
}
</script>
```

### Step 2: Modify `src/taskpane/taskpane.js`

Update the `loadConfiguration()` method:

```javascript
async loadConfiguration() {
    try {
        // Load from inline script tag (no server fetch)
        const configElement = document.getElementById('config-data');
        if (configElement) {
            const config = JSON.parse(configElement.textContent);
            this.templates = config.templates || [];
            this.settings = config.settings || {};
            console.log('Loaded configuration from inline data');
            return;
        }

        // Fallback: try to load from file (if hosted)
        const response = await fetch('../../config/templates.json');
        if (response.ok) {
            const config = await response.json();
            this.templates = config.templates || [];
            this.settings = config.settings || {};
        }
    } catch (error) {
        console.error('Configuration load error:', error);
        this.loadDefaultConfiguration();
    }
}
```

Now you have **zero external dependencies** - everything is self-contained in HTML!

## Option 2: GitHub Pages (Free)

Perfect for personal/small team use.

### Setup

1. **Create gh-pages branch**:
```bash
git checkout -b gh-pages
```

2. **Prepare files**:
```bash
# Copy files to root for GitHub Pages
cp -r src/* .
cp config/templates.json .
```

3. **Update manifest.xml**:
```xml
<!-- Replace localhost URLs with GitHub Pages URL -->
<SourceLocation DefaultValue="https://yourusername.github.io/outlookadin/taskpane.html"/>
```

4. **Push to GitHub**:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

5. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: gh-pages branch
   - Your add-in is now live at `https://yourusername.github.io/outlookadin`

### Pros & Cons
- ✅ Free forever
- ✅ Automatic HTTPS
- ✅ Simple deployment
- ❌ Public only (unless you have private repos)
- ❌ Slower updates (GitHub Pages cache)

## Option 3: Netlify (Recommended)

Best option for static hosting with great developer experience.

### Method A: Drag & Drop (Easiest)

1. Go to [netlify.com](https://netlify.com)
2. Drag your project folder to the upload area
3. Netlify automatically:
   - Builds and deploys
   - Provides HTTPS
   - Gives you a URL like `https://your-addin.netlify.app`

### Method B: Git Integration

1. **Create `netlify.toml`**:
```toml
[build]
  publish = "."
  command = "echo 'Static files ready'"

[[redirects]]
  from = "/*"
  to = "/src/taskpane/taskpane.html"
  status = 200
```

2. **Connect Git repo** at netlify.com
3. Auto-deploys on every push

### Method C: CLI

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Update Manifest

```xml
<SourceLocation DefaultValue="https://your-addin.netlify.app/src/taskpane/taskpane.html"/>
```

### Pros & Cons
- ✅ Free tier generous
- ✅ Instant deploys
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Deploy previews
- ✅ Edge CDN
- ✅ Can be private

## Option 4: Vercel

Similar to Netlify, optimized for performance.

### Deploy

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com)

### Configuration

Create `vercel.json`:
```json
{
  "version": 2,
  "public": true,
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Pros & Cons
- ✅ Extremely fast CDN
- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Great DX
- ✅ Custom domains

## Option 5: Azure Static Web Apps (Free)

Perfect if you're in the Microsoft ecosystem.

### Deploy

1. Install Azure CLI:
```bash
npm install -g @azure/static-web-apps-cli
```

2. Login and deploy:
```bash
az login
az staticwebapp create \
  --name outlookadin \
  --resource-group myResourceGroup \
  --source .
```

3. Or use VS Code extension: "Azure Static Web Apps"

### Pros & Cons
- ✅ Free tier (100GB bandwidth/month)
- ✅ Integrated with Azure
- ✅ Custom domains
- ✅ API support if needed later
- ✅ Global CDN

## Option 6: Cloudflare Pages (Free)

### Deploy

1. Connect GitHub repo at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Build settings:
   - Build command: (leave empty)
   - Build output: `/`
3. Deploy

### Pros & Cons
- ✅ Free unlimited
- ✅ Lightning fast CDN
- ✅ Automatic HTTPS
- ✅ DDoS protection

## Option 7: AWS S3 + CloudFront

For enterprise deployments.

### Deploy

1. **Create S3 bucket**:
```bash
aws s3 mb s3://outlook-addin
```

2. **Upload files**:
```bash
aws s3 sync . s3://outlook-addin --exclude ".git/*"
```

3. **Enable static hosting**:
```bash
aws s3 website s3://outlook-addin --index-document taskpane.html
```

4. **Setup CloudFront** for HTTPS
5. **Create SSL certificate** in AWS Certificate Manager

### Pros & Cons
- ✅ Enterprise grade
- ✅ Scalable
- ✅ Custom domains
- ❌ More setup required
- ❌ Costs (but very low for static files)

## Recommended Project Structure for Static Hosting

```
outlookadin/
├── index.html                  # Root file
├── manifest.xml               # Must be accessible at root
├── taskpane.html             # Or in src/ folder
├── taskpane.css
├── taskpane.js
├── templates.json            # Optional if using inline config
└── assets/
    └── icons/
```

## Configuration Management

### Strategy 1: Inline (Best for Static)
Embed everything in HTML - no external files.

### Strategy 2: Static JSON
Keep `templates.json` file but load it as a static resource.

### Strategy 3: Environment Variables (Advanced)
Use build-time variables:

```javascript
// Use at build time
const BCC_EMAIL = process.env.BCC_EMAIL || 'default@email.com';
```

Build scripts can replace these during deployment.

## CORS Considerations

Static hosting **eliminates** CORS issues because:
- No cross-origin requests
- All files served from same domain
- Office.js handles Outlook API calls

## Updating Templates

### With Inline Config
1. Edit HTML file
2. Redeploy

### With JSON File
1. Edit `templates.json`
2. Upload new file
3. Changes appear immediately (check cache)

### Cache Busting
Add version numbers to force refresh:
```html
<script src="taskpane.js?v=2"></script>
```

Or use hash-based filenames:
```html
<script src="taskpane.abc123.js"></script>
```

## Testing Static Deployment

Before deploying, test locally with a simple HTTP server:

### Python
```bash
python -m http.server 3000
```

### Node.js
```bash
npx http-server -p 3000
```

### PHP
```bash
php -S localhost:3000
```

Then access: `http://localhost:3000/src/taskpane/taskpane.html`

## Manifest Updates for Production

Update all URLs in `manifest.xml`:

```xml
<!-- Replace all localhost:3000 with your production URL -->
<SourceLocation DefaultValue="https://your-domain.com/taskpane.html"/>
<bt:Url id="Taskpane.Url" DefaultValue="https://your-domain.com/taskpane.html"/>
```

## Security Benefits of Static Hosting

- ✅ No server to hack
- ✅ No database vulnerabilities
- ✅ No SQL injection
- ✅ Reduced attack surface
- ✅ Easier security audits
- ✅ Lower maintenance

## Performance Benefits

- ✅ Faster load times (CDN edge caching)
- ✅ No server processing delay
- ✅ Global distribution
- ✅ Unlimited scalability
- ✅ Lower latency

## Cost Comparison

| Service | Free Tier | Cost |
|---------|-----------|------|
| GitHub Pages | ✅ 100% Free | $0 |
| Netlify | 100GB bandwidth | $0-$19/mo |
| Vercel | 100GB bandwidth | $0-$20/mo |
| Cloudflare Pages | Unlimited | $0 |
| Azure Static | 100GB bandwidth | $0-$9/mo |
| AWS S3 + CloudFront | 1GB free first year | ~$1-5/mo |

For a typical Outlook add-in with <1000 users, **all options stay in free tier**.

## Recommended Setup

**For Development**: Use included `server.js`
```bash
npm start
```

**For Production**: Netlify or Vercel
- Push to GitHub
- Connect repo
- Auto-deploy on commit
- Zero configuration needed

## Example: Full Static Deployment to Netlify

```bash
# 1. Prepare files
mkdir deploy
cp -r src/* deploy/
cp config/templates.json deploy/
cp manifest.xml deploy/

# 2. Update manifest URLs in deploy/manifest.xml
# Replace localhost:3000 with netlify URL

# 3. Deploy
cd deploy
netlify deploy --prod

# 4. Note the URL, update manifest if needed

# 5. Load in Outlook using the manifest URL
# https://your-site.netlify.app/manifest.xml
```

## Summary

**Answer**: Yes! You can run this add-in with **zero backend server**. Just:

1. Host static files anywhere with HTTPS
2. All logic runs client-side via Office.js
3. No database, API, or server processing needed
4. Free hosting options available

**Recommended**: Netlify (easiest) or GitHub Pages (if already on GitHub)

The add-in is already designed for static hosting - you just need to choose where to host the files!

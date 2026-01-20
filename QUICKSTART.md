# Quick Start Guide

Get the Email Template Manager running in 5 minutes!

## Step 1: Install (1 minute)

```bash
npm install
```

## Step 2: Configure (2 minutes)

Open `config/templates.json` and update:

```json
{
  "settings": {
    "bccEmail": "YOUR-EMAIL@company.com",  // ← Change this
    "trackingDomain": "track.yourcompany.com"  // ← Change this
  }
}
```

## Step 3: Start Server (30 seconds)

```bash
npm start
```

You should see:
```
Server running at: http://localhost:3000
Manifest available at: http://localhost:3000/manifest.xml
```

## Step 4: Add to Outlook (1 minute)

### Outlook on the Web
1. Go to https://outlook.office.com
2. Click ⚙️ Settings → View all Outlook settings
3. Mail → Customize actions → Get Add-ins
4. My add-ins → Custom add-ins → Add from URL
5. Enter: `http://localhost:3000/manifest.xml`
6. Click Install

### Outlook Desktop
1. File → Manage Add-ins
2. Custom add-ins → Add from file
3. Select `manifest.xml` from your project folder
4. Click Install

## Step 5: Use It! (30 seconds)

1. Create a new email in Outlook
2. Look for "Insert Template" button in the ribbon
3. Click it to open the add-in pane
4. Select a template (try "Sales Introduction")
5. Fill in the fields
6. Click "Insert Template"

Done! Your email is ready with automatic BCC and tracking.

## What's Next?

- **Customize Templates**: Edit `config/templates.json` to add your own templates
- **Add Job Functions**: Create templates for different departments
- **Deploy to Production**: See [INSTALLATION.md](INSTALLATION.md) for production deployment
- **Integrate Backend**: Connect to your API instead of using JSON file

## Common Issues

### "Add-in not showing up"
- Make sure server is running (`npm start`)
- Check that you're in a new email composition window
- Try restarting Outlook

### "Templates not loading"
- Check browser console (F12) for errors
- Verify `templates.json` is valid JSON
- Ensure server is accessible at `localhost:3000`

### "BCC not working"
- BCC requires Outlook 2013+ or Outlook on the Web
- Older versions don't support BCC API

## Need Help?

- 📖 Read [INSTALLATION.md](INSTALLATION.md) for detailed instructions
- 🔧 Check [CONFIGURATION.md](CONFIGURATION.md) for configuration options
- 💬 Open an issue on GitHub

Enjoy your new email productivity tool!

# Installation Guide

This guide will help you install and configure the Email Template Manager add-in for Outlook.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Outlook (Desktop, Web, or Mobile)
- For production: SSL certificate and hosting

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Templates

Edit `config/templates.json` to customize:
- BCC email address for tracking
- Tracking domain for pixel tracking
- Email templates for different job functions

Example configuration:
```json
{
  "settings": {
    "bccEmail": "your-tracking-email@company.com",
    "trackingDomain": "track.yourcompany.com"
  },
  "templates": [
    // Your templates here
  ]
}
```

### 3. Start the Development Server

```bash
npm start
```

The server will start at `http://localhost:3000`

### 4. Sideload the Add-in

#### For Outlook on the Web:

1. Go to [Outlook on the Web](https://outlook.office.com)
2. Click the Settings gear icon → View all Outlook settings
3. Navigate to Mail → Customize actions → Get Add-ins
4. Click "My add-ins" in the left sidebar
5. Under "Custom add-ins", click "+ Add a custom add-in"
6. Select "Add from URL"
7. Enter: `http://localhost:3000/manifest.xml`
8. Click "Install"

#### For Outlook Desktop (Windows):

1. Save the `manifest.xml` file to a network share or local folder
2. Open Outlook Desktop
3. Go to File → Manage Add-ins (or use the Office 365 admin center)
4. Click "Custom add-ins" → "Add custom add-in" → "Add from file"
5. Browse to your `manifest.xml` file and select it
6. Click "Install"

#### For Outlook Desktop (Mac):

1. Open Outlook for Mac
2. Click the "Get Add-ins" button in the ribbon
3. Select "My add-ins" tab
4. Under "Custom add-ins", click "Add a custom add-in"
5. Select "Add from URL"
6. Enter the manifest URL and click "Install"

## Production Deployment

For production deployment, you need:

1. **HTTPS Hosting**: Office add-ins require HTTPS in production
   - Use services like Azure, AWS, Heroku, or any hosting with SSL

2. **Update Manifest URLs**: Replace `https://localhost:3000` with your production URL in `manifest.xml`

3. **SSL Certificate**: Ensure your hosting has a valid SSL certificate

4. **Update Configuration**: Set production BCC email and tracking domain

### Example Production Deployment (Azure):

```bash
# Login to Azure
az login

# Create a resource group
az group create --name outlook-addin-rg --location eastus

# Create an App Service plan
az appservice plan create --name outlook-addin-plan --resource-group outlook-addin-rg --sku B1

# Create a web app
az webapp create --resource-group outlook-addin-rg --plan outlook-addin-plan --name your-addin-name

# Deploy your code
az webapp deployment source config-local-git --name your-addin-name --resource-group outlook-addin-rg

# Push your code
git remote add azure <deployment-url>
git push azure main
```

## Troubleshooting

### Add-in doesn't appear in Outlook:
- Ensure the server is running
- Check that the manifest URL is accessible
- Clear your Office cache (delete folder: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`)

### BCC not working:
- BCC functionality requires Outlook 2013+ or Outlook on the Web
- Ensure ReadWriteMailbox permission is granted

### Templates not loading:
- Check browser console for errors
- Verify `config/templates.json` is valid JSON
- Ensure the server can access the config file

### CORS errors:
- Ensure the server has CORS enabled (included in `server.js`)
- Check that URLs in manifest match your server URL

## Testing

1. Create a new email in Outlook
2. Click the "Insert Template" button in the ribbon
3. Select a template and fill in the fields
4. Click "Insert Template"
5. Verify that:
   - Subject is set correctly
   - Body contains the template content
   - BCC email is added
   - Tracking code is embedded (view HTML source)

## Support

For issues and questions:
- Check the [README.md](README.md) for usage information
- Review the [Troubleshooting](#troubleshooting) section
- Open an issue on GitHub

# Email Template Manager for Outlook

A powerful Outlook add-in that enables users to create templatized emails based on job functions. The add-in automatically adds BCC tracking emails and invisible unique tracking codes to monitor email conversations.

## ⚡ No Backend Required!

This add-in works with **pure static file hosting** - no server-side code, database, or API needed! Deploy to:
- Netlify, Vercel, or Cloudflare Pages (free)
- GitHub Pages (free)
- Azure Static Web Apps (free)
- Any HTTPS static hosting

All logic runs client-side via Office.js. The included `server.js` is just for local development convenience. See [STATIC-HOSTING.md](STATIC-HOSTING.md) for deployment options.

## Features

- **Template Management**: Create and manage email templates organized by job function (Sales, Support, HR, Marketing, etc.)
- **Dynamic Placeholders**: Use customizable placeholders in templates that get replaced with user input
- **Automatic BCC**: Automatically add a tracking email address to BCC for all templated emails
- **Invisible Tracking**: Embed unique tracking codes and pixels for conversation monitoring
- **Cross-Platform**: Works with Outlook on the Web, Outlook Desktop (Windows/Mac), and Outlook Mobile
- **Flexible Configuration**: Powered by JSON configuration file or backend API service
- **Live Preview**: See template preview as you fill in placeholder values
- **Job Function Filtering**: Quickly find templates by filtering by department/role

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Templates

Edit `config/templates.json` to set your BCC email and customize templates:

```json
{
  "settings": {
    "bccEmail": "tracking@yourcompany.com",
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

Server will run at `http://localhost:3000`

### 4. Sideload in Outlook

- **Outlook Web**: Settings → Get Add-ins → My add-ins → Add from URL → `http://localhost:3000/manifest.xml`
- **Outlook Desktop**: File → Manage Add-ins → Add from file → Select `manifest.xml`

## How It Works

### Template Selection
1. Open a new email in Outlook
2. Click "Insert Template" button in the ribbon
3. Filter templates by job function (optional)
4. Select your desired template

### Customization
1. Fill in dynamic placeholder fields (e.g., {{firstName}}, {{companyName}})
2. Preview updates in real-time as you type
3. Review the complete email preview

### Insertion
1. Click "Insert Template" button
2. The add-in will:
   - Set the email subject
   - Insert the formatted body content
   - Add BCC tracking email automatically
   - Embed invisible tracking code and pixel
   - Generate unique tracking ID (e.g., `ST-INTRO-1705847392847-A8F9D2`)

## Project Structure

```
outlookadin/
├── manifest.xml                 # Add-in manifest file
├── package.json                 # Node.js dependencies
├── server.js                    # Development server
├── config/
│   └── templates.json          # Template configuration
├── src/
│   └── taskpane/
│       ├── taskpane.html       # UI layout
│       ├── taskpane.css        # Styling
│       └── taskpane.js         # Core logic
├── assets/                      # Icons and images
├── INSTALLATION.md              # Detailed installation guide
├── CONFIGURATION.md             # Configuration reference
└── README.md                    # This file
```

## Template Configuration

Templates support dynamic placeholders using `{{placeholderName}}` syntax:

```json
{
  "id": "sales-intro",
  "jobFunction": "Sales",
  "name": "Sales Introduction",
  "subject": "Introduction - {{companyName}}",
  "body": "<p>Hi {{firstName}},</p><p>I'm reaching out from {{senderCompany}}...</p>",
  "trackingCode": "ST-INTRO"
}
```

Placeholders are automatically detected and converted to input fields in the UI.

## Tracking Features

### Automatic BCC
Every templated email automatically includes the configured BCC email address for tracking purposes.

### Invisible Tracking Code
Each email gets a unique tracking code in the format: `{TEMPLATE-CODE}-{TIMESTAMP}-{RANDOM}`

Example: `ST-INTRO-1705847392847-A8F9D2`

### Tracking Pixel
An invisible 1x1 pixel is embedded in the email for open tracking:
```html
<img src="https://track.yourcompany.com/track.gif?code=TRACKING-CODE"
     width="1" height="1" style="display:none;" />
```

### Metadata
Hidden metadata is embedded for conversation tracking:
```html
<div style="display:none;" data-template-id="sales-intro"
     data-tracking-code="ST-INTRO-1705847392847-A8F9D2">
  <!-- Tracking code -->
</div>
```

## Available Job Functions

The add-in comes pre-configured with templates for:

- **Sales**: Introductions, follow-ups, proposals
- **Customer Support**: Welcome messages, issue resolution
- **Human Resources**: Interview invites, offer letters
- **Marketing**: Product launches, newsletters
- **Executive**: Meeting requests, announcements
- **Finance**: Invoices, payment reminders

You can add custom job functions in the configuration file.

## Backend Service Integration

Instead of using a static JSON file, you can integrate with a backend API:

```javascript
// Modify src/taskpane/taskpane.js
async loadConfiguration() {
    const response = await fetch('https://api.yourcompany.com/templates', {
        headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
    });
    const config = await response.json();
    this.templates = config.templates;
    this.settings = config.settings;
}
```

## 🏢 Enterprise Deployment (Azure)

For enterprise deployments requiring Entra ID authentication, compliance, and enhanced security, we provide a complete Azure architecture.

### Enterprise Features

- **Entra ID (Azure AD) Authentication**: Single Sign-On with MFA
- **Role-Based Access Control (RBAC)**: TemplateUser, TemplateAdmin roles
- **Azure Front Door with WAF**: DDoS protection, geo-filtering, rate limiting
- **Compliance**: SOC 2, ISO 27001, GDPR, HIPAA, FedRAMP ready
- **Monitoring**: Azure Monitor, Log Analytics, Azure Sentinel integration
- **Audit Logging**: Complete audit trail for all actions
- **Conditional Access**: Device compliance, risk-based policies
- **Data Encryption**: At rest and in transit with customer-managed keys
- **Disaster Recovery**: Multi-region deployment with automated failover

### Architecture

```
Microsoft 365 → Azure Front Door (WAF) → Azure Static Web Apps (Entra ID)
                                            ↓
                                     Azure Key Vault
                                            ↓
                              Azure Functions (Optional)
                                            ↓
                                   Azure Cosmos DB (Optional)
                                            ↓
                              Azure Monitor & Sentinel
```

### Quick Start - Enterprise Deployment

```bash
# 1. Create Azure resources
az group create --name rg-outlook-addin-prod --location eastus
az staticwebapp create --name swa-outlook-addin --resource-group rg-outlook-addin-prod

# 2. Configure Entra ID
# See AZURE-ENTERPRISE.md for detailed steps

# 3. Deploy
git push origin main  # Automatic deployment via GitHub Actions
```

### Cost Estimate

- **Small Org** (< 100 users): ~$100-150/month
- **Medium Org** (100-1000 users): ~$200-300/month
- **Large Org** (1000+ users): ~$300-500/month

Includes all Azure services, monitoring, and compliance features.

### Documentation

📘 **[AZURE-ENTERPRISE.md](AZURE-ENTERPRISE.md)** - Complete enterprise deployment guide with:
- Architecture diagrams
- Security configuration
- Entra ID setup
- Compliance & auditing
- Disaster recovery
- Cost optimization

## Requirements

- **Node.js**: Version 14 or higher (development only)
- **Outlook**:
  - Outlook on the Web (all browsers)
  - Outlook 2013 or later (Windows)
  - Outlook 2016 or later (Mac)
  - Outlook Mobile (iOS/Android)
- **Permissions**: ReadWriteMailbox

### Enterprise Requirements

- Azure subscription (Pay-as-you-go or Enterprise Agreement)
- Entra ID (Azure AD) Premium P1 or P2
- Custom domain with SSL
- Security team approval

## Production Deployment

### Standard Deployment (Static Hosting)

For production deployment without authentication:

1. **Host with HTTPS**: Office add-ins require secure hosting
2. **Update Manifest URLs**: Replace `localhost:3000` with your production URL
3. **SSL Certificate**: Ensure valid SSL certificate
4. **Update Configuration**: Set production BCC and tracking domain

See [INSTALLATION.md](INSTALLATION.md) for detailed deployment instructions.
See [STATIC-HOSTING.md](STATIC-HOSTING.md) for free hosting options.

### Enterprise Deployment (Azure + Entra ID)

For enterprise deployment with authentication and compliance:

1. Follow the **[AZURE-ENTERPRISE.md](AZURE-ENTERPRISE.md)** guide
2. Configure Entra ID authentication
3. Set up RBAC and conditional access
4. Enable monitoring and compliance features
5. Configure disaster recovery

Deployment time: 2-4 hours (including security configuration)

## Documentation

### Getting Started
- [README.md](README.md) - This file, overview and quick start
- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
- [INSTALLATION.md](INSTALLATION.md) - Complete installation guide

### Configuration
- [CONFIGURATION.md](CONFIGURATION.md) - Template configuration reference
- [BACKEND-INTEGRATION.md](BACKEND-INTEGRATION.md) - Backend API integration

### Deployment
- [STATIC-HOSTING.md](STATIC-HOSTING.md) - Static hosting deployment (free options)
- **[AZURE-ENTERPRISE.md](AZURE-ENTERPRISE.md)** - Enterprise Azure deployment with Entra ID

## Troubleshooting

### Add-in doesn't appear
- Ensure server is running (`npm start`)
- Clear Office cache: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
- Verify manifest URL is accessible

### BCC not working
- Requires Outlook 2013+ or Outlook on the Web
- Check ReadWriteMailbox permission is granted

### Templates not loading
- Verify `config/templates.json` is valid JSON
- Check browser console for errors
- Ensure server can access config file

## Security & Privacy

- **BCC Emails**: Only visible to sender, not recipients
- **Tracking Codes**: Embedded invisibly in HTML
- **Data Storage**: All data stored locally or in your backend
- **Permissions**: Only requests necessary Outlook permissions

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check documentation in [INSTALLATION.md](INSTALLATION.md) and [CONFIGURATION.md](CONFIGURATION.md)

## Acknowledgments

Built with:
- [Office.js](https://docs.microsoft.com/office/dev/add-ins/overview/office-add-ins) - Office Add-ins JavaScript API
- [Express.js](https://expressjs.com/) - Web server framework
- HTML5, CSS3, Vanilla JavaScript

---

Made with ❤️ for improving email productivity

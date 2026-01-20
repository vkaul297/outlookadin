# Email Template Manager for Outlook

A powerful Outlook add-in that enables users to create templatized emails based on job functions. The add-in automatically adds BCC tracking emails and invisible unique tracking codes to monitor email conversations.

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

## Requirements

- **Node.js**: Version 14 or higher
- **Outlook**:
  - Outlook on the Web (all browsers)
  - Outlook 2013 or later (Windows)
  - Outlook 2016 or later (Mac)
  - Outlook Mobile (iOS/Android)
- **Permissions**: ReadWriteMailbox

## Production Deployment

For production deployment:

1. **Host with HTTPS**: Office add-ins require secure hosting
2. **Update Manifest URLs**: Replace `localhost:3000` with your production URL
3. **SSL Certificate**: Ensure valid SSL certificate
4. **Update Configuration**: Set production BCC and tracking domain

See [INSTALLATION.md](INSTALLATION.md) for detailed deployment instructions.

## Documentation

- [INSTALLATION.md](INSTALLATION.md) - Complete installation and deployment guide
- [CONFIGURATION.md](CONFIGURATION.md) - Configuration reference and examples

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

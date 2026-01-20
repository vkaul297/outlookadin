# Configuration Guide

This document explains how to configure the Email Template Manager add-in.

## Configuration File

The main configuration file is located at `config/templates.json`.

## Configuration Structure

```json
{
  "settings": {
    "bccEmail": "tracking@yourcompany.com",
    "trackingDomain": "track.yourcompany.com"
  },
  "templates": [
    {
      "id": "unique-template-id",
      "jobFunction": "Sales",
      "name": "Template Display Name",
      "subject": "Email Subject with {{placeholders}}",
      "body": "<p>Email body HTML with {{placeholders}}</p>",
      "trackingCode": "TEMPLATE-CODE"
    }
  ]
}
```

## Settings Section

### bccEmail
- **Type**: String
- **Required**: Yes
- **Description**: Email address that will be automatically added as BCC to all emails
- **Example**: `"tracking@company.com"`

### trackingDomain
- **Type**: String
- **Required**: Yes
- **Description**: Domain used for tracking pixel URLs
- **Example**: `"track.company.com"`

## Templates Section

Each template is an object with the following properties:

### id
- **Type**: String
- **Required**: Yes
- **Description**: Unique identifier for the template
- **Example**: `"sales-intro"`

### jobFunction
- **Type**: String
- **Required**: Yes
- **Description**: Category/department for filtering templates
- **Options**: "Sales", "Customer Support", "Human Resources", "Marketing", "Executive", "Finance"
- **Example**: `"Sales"`

### name
- **Type**: String
- **Required**: Yes
- **Description**: Display name shown in the template selector
- **Example**: `"Sales Introduction"`

### subject
- **Type**: String
- **Required**: Yes
- **Description**: Email subject line with optional placeholders
- **Example**: `"Introduction - {{companyName}}"`

### body
- **Type**: String (HTML)
- **Required**: Yes
- **Description**: Email body content in HTML format with optional placeholders
- **Example**:
```json
"<p>Hi {{firstName}},</p><p>Your content here...</p>"
```

### trackingCode
- **Type**: String
- **Required**: Yes
- **Description**: Short code prefix for tracking (will be combined with timestamp and random string)
- **Example**: `"ST-INTRO"` (becomes `ST-INTRO-1234567890-ABC123`)

## Placeholders

Placeholders are dynamic fields that users fill in when using a template.

### Syntax
- Use double curly braces: `{{placeholderName}}`
- Use camelCase for placeholder names
- Example: `{{firstName}}`, `{{companyName}}`, `{{phoneNumber}}`

### Supported Locations
- Subject line
- Email body

### Example Template with Placeholders

```json
{
  "id": "welcome-email",
  "jobFunction": "Customer Support",
  "name": "Welcome Email",
  "subject": "Welcome to {{companyName}}, {{firstName}}!",
  "body": "<p>Hi {{firstName}},</p><p>Welcome to {{companyName}}! We're excited to have you on board.</p><p>Your account manager is {{accountManager}} and you can reach them at {{managerEmail}}.</p><p>Best regards,<br>The Team</p>",
  "trackingCode": "CS-WLCM"
}
```

This will create input fields for:
- companyName
- firstName
- accountManager
- managerEmail

## Job Functions

Predefined job functions for organizing templates:

1. **Sales** - Sales team templates (introductions, follow-ups, proposals)
2. **Customer Support** - Support templates (issue resolution, welcome messages)
3. **Human Resources** - HR templates (interview invites, offer letters)
4. **Marketing** - Marketing templates (newsletters, product launches)
5. **Executive** - Executive templates (meeting requests, announcements)
6. **Finance** - Finance templates (invoices, payment reminders)

You can add custom job functions by using any string value.

## HTML Formatting in Templates

The body field supports full HTML formatting:

### Text Formatting
```html
<strong>Bold text</strong>
<em>Italic text</em>
<u>Underlined text</u>
```

### Lists
```html
<ul>
  <li>Bullet point 1</li>
  <li>Bullet point 2</li>
</ul>

<ol>
  <li>Numbered item 1</li>
  <li>Numbered item 2</li>
</ol>
```

### Links
```html
<a href="https://example.com">Click here</a>
```

### Line Breaks and Paragraphs
```html
<p>First paragraph</p>
<p>Second paragraph</p>
<br> <!-- Single line break -->
```

## Tracking Configuration

### Tracking Pixel

The add-in automatically inserts an invisible 1x1 pixel image:

```html
<img src="https://track.yourcompany.com/track.gif?code=TRACKING-CODE"
     width="1" height="1"
     style="display:none;opacity:0;position:absolute;"
     alt="" />
```

### Tracking Metadata

Additional invisible metadata is added:

```html
<div style="display:none;visibility:hidden;"
     data-template-id="template-id"
     data-tracking-code="TRACKING-CODE">
  <!-- TRACKING-CODE -->
</div>
```

### Tracking Code Format

Format: `{TEMPLATE-CODE}-{TIMESTAMP}-{RANDOM}`

Example: `ST-INTRO-1705847392847-A8F9D2`

- **TEMPLATE-CODE**: From template configuration
- **TIMESTAMP**: Unix timestamp in milliseconds
- **RANDOM**: 6-character random string

## Backend Service Integration

Instead of using a static JSON file, you can integrate with a backend service:

### Modify `src/taskpane/taskpane.js`

Replace the `loadConfiguration()` method:

```javascript
async loadConfiguration() {
    try {
        // Call your API endpoint
        const response = await fetch('https://api.yourcompany.com/templates', {
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load configuration');
        }

        const config = await response.json();
        this.templates = config.templates || [];
        this.settings = config.settings || {};
    } catch (error) {
        console.error('Configuration load error:', error);
        this.loadDefaultConfiguration();
    }
}
```

### API Response Format

Your API should return JSON in this format:

```json
{
  "settings": {
    "bccEmail": "tracking@yourcompany.com",
    "trackingDomain": "track.yourcompany.com"
  },
  "templates": [
    // Array of template objects
  ]
}
```

## Environment-Specific Configuration

For different environments (development, staging, production):

1. Create multiple config files:
   - `config/templates.dev.json`
   - `config/templates.staging.json`
   - `config/templates.prod.json`

2. Update server.js to load based on environment:

```javascript
const env = process.env.NODE_ENV || 'dev';
const configFile = `./config/templates.${env}.json`;
```

3. Set environment variable:
```bash
NODE_ENV=production npm start
```

## Validation

Before deploying, validate your configuration:

1. **JSON Syntax**: Use a JSON validator
2. **Required Fields**: Ensure all required fields are present
3. **Placeholder Consistency**: Verify placeholders in subject/body match
4. **HTML Validity**: Check HTML in body fields
5. **Tracking Codes**: Ensure tracking codes are unique

## Example Complete Configuration

See [config/templates.json](config/templates.json) for a complete example with 10 templates across 6 job functions.

## Best Practices

1. **Naming**: Use descriptive template names
2. **Placeholders**: Keep placeholder names clear and consistent
3. **Tracking Codes**: Use short, meaningful codes (e.g., `ST-` for Sales Templates)
4. **HTML**: Test HTML rendering in Outlook before deployment
5. **Testing**: Test each template after adding/modifying
6. **Documentation**: Comment complex templates
7. **Versioning**: Version your configuration file
8. **Backup**: Keep backups of configuration files

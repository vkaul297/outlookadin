# Backend Service Integration Guide

This guide explains how to integrate the Email Template Manager with a backend service instead of using a static JSON configuration file.

## Overview

By default, the add-in loads templates from `config/templates.json`. For dynamic template management, user-specific templates, or centralized configuration, you can integrate with a backend API.

## Benefits of Backend Integration

- **Dynamic Templates**: Update templates without redeploying the add-in
- **User-Specific**: Serve different templates based on user roles/permissions
- **Analytics**: Track template usage and performance
- **Centralized Management**: Manage templates across multiple add-ins
- **Validation**: Server-side validation and sanitization
- **Versioning**: Template version control and rollback

## Backend API Requirements

Your backend API should provide an endpoint that returns template configuration in JSON format.

### Endpoint Example

```
GET https://api.yourcompany.com/outlook-templates
```

### Response Format

```json
{
  "settings": {
    "bccEmail": "tracking@company.com",
    "trackingDomain": "track.company.com"
  },
  "templates": [
    {
      "id": "sales-intro",
      "jobFunction": "Sales",
      "name": "Sales Introduction",
      "subject": "Introduction - {{companyName}}",
      "body": "<p>Hi {{firstName}},</p>...",
      "trackingCode": "ST-INTRO"
    }
  ]
}
```

### Optional: User-Specific Endpoint

```
GET https://api.yourcompany.com/outlook-templates?userId={userId}
GET https://api.yourcompany.com/users/{userId}/templates
```

## Implementation

### Step 1: Modify JavaScript

Edit `src/taskpane/taskpane.js` and update the `loadConfiguration()` method:

```javascript
// Replace the existing loadConfiguration method
async loadConfiguration() {
    try {
        // Get user information (optional)
        const userId = await this.getCurrentUserId();

        // Call your backend API
        const response = await fetch('https://api.yourcompany.com/outlook-templates', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`,
                // Optional: Pass user ID in header
                'X-User-Id': userId
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const config = await response.json();

        // Validate response
        if (!config.templates || !Array.isArray(config.templates)) {
            throw new Error('Invalid configuration format');
        }

        this.templates = config.templates;
        this.settings = config.settings || {};

        console.log(`Loaded ${this.templates.length} templates from backend`);

    } catch (error) {
        console.error('Backend configuration load error:', error);
        // Fallback to local configuration or default
        this.loadDefaultConfiguration();
        this.showStatus('Using offline configuration. Check backend connection.', 'info');
    }
}
```

### Step 2: Add Authentication

If your API requires authentication, add a method to get/store tokens:

```javascript
getAuthToken() {
    // Option 1: Use Office SSO (Single Sign-On)
    // https://docs.microsoft.com/en-us/office/dev/add-ins/develop/sso-in-office-add-ins

    // Option 2: Store token in local storage
    return localStorage.getItem('apiToken') || '';

    // Option 3: Use environment variable or config
    // return 'YOUR_API_TOKEN';
}

// Get current user's Office email (if needed)
async getCurrentUserId() {
    return new Promise((resolve) => {
        if (Office.context.mailbox && Office.context.mailbox.userProfile) {
            resolve(Office.context.mailbox.userProfile.emailAddress);
        } else {
            resolve('unknown');
        }
    });
}
```

### Step 3: Add Caching (Optional)

Reduce API calls by caching templates:

```javascript
async loadConfiguration() {
    try {
        // Check cache first
        const cached = this.getFromCache('templates');
        if (cached && !this.isCacheExpired(cached.timestamp)) {
            this.templates = cached.templates;
            this.settings = cached.settings;
            console.log('Loaded templates from cache');
            return;
        }

        // Fetch from API
        const response = await fetch('https://api.yourcompany.com/outlook-templates', {
            headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
        });

        const config = await response.json();

        // Cache the response
        this.saveToCache('templates', {
            templates: config.templates,
            settings: config.settings,
            timestamp: Date.now()
        });

        this.templates = config.templates;
        this.settings = config.settings;

    } catch (error) {
        console.error('Configuration load error:', error);
        this.loadDefaultConfiguration();
    }
}

saveToCache(key, data) {
    localStorage.setItem(`etm_${key}`, JSON.stringify(data));
}

getFromCache(key) {
    const data = localStorage.getItem(`etm_${key}`);
    return data ? JSON.parse(data) : null;
}

isCacheExpired(timestamp, maxAge = 3600000) {
    // Default: 1 hour cache (3600000ms)
    return (Date.now() - timestamp) > maxAge;
}
```

## Backend Implementation Examples

### Node.js + Express

```javascript
const express = require('express');
const app = express();

app.get('/outlook-templates', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch templates from database
        const templates = await db.getTemplatesForUser(userId);
        const settings = await db.getUserSettings(userId);

        res.json({
            settings: {
                bccEmail: settings.bccEmail,
                trackingDomain: settings.trackingDomain
            },
            templates: templates
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load templates' });
    }
});

function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    // Validate token
    if (isValidToken(token)) {
        req.user = getUserFromToken(token);
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}
```

### Python + Flask

```python
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/outlook-templates')
@require_auth
def get_templates():
    try:
        user_id = get_user_id_from_token(request.headers.get('Authorization'))

        templates = db.get_user_templates(user_id)
        settings = db.get_user_settings(user_id)

        return jsonify({
            'settings': {
                'bccEmail': settings['bcc_email'],
                'trackingDomain': settings['tracking_domain']
            },
            'templates': templates
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### C# + ASP.NET Core

```csharp
[ApiController]
[Route("api/outlook-templates")]
public class TemplatesController : ControllerBase
{
    private readonly ITemplateService _templateService;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetTemplates()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var templates = await _templateService.GetUserTemplatesAsync(userId);
            var settings = await _templateService.GetUserSettingsAsync(userId);

            return Ok(new
            {
                Settings = new
                {
                    BccEmail = settings.BccEmail,
                    TrackingDomain = settings.TrackingDomain
                },
                Templates = templates
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = ex.Message });
        }
    }
}
```

## Advanced Features

### Template Analytics

Track template usage:

```javascript
async insertTemplate() {
    // ... existing code ...

    // After successful insertion, send analytics
    await this.trackTemplateUsage(this.currentTemplate.id, trackingCode);
}

async trackTemplateUsage(templateId, trackingCode) {
    try {
        await fetch('https://api.yourcompany.com/analytics/template-usage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
                templateId: templateId,
                trackingCode: trackingCode,
                timestamp: new Date().toISOString(),
                userId: await this.getCurrentUserId()
            })
        });
    } catch (error) {
        console.error('Analytics error:', error);
        // Don't fail the operation if analytics fails
    }
}
```

### Real-time Template Updates

Use WebSockets for real-time updates:

```javascript
connectToWebSocket() {
    const ws = new WebSocket('wss://api.yourcompany.com/templates/updates');

    ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        if (update.type === 'template_updated') {
            this.loadConfiguration(); // Reload templates
            this.showStatus('Templates updated', 'info');
        }
    };
}
```

### Conditional Templates

Show templates based on user context:

```javascript
async loadConfiguration() {
    const userRole = await this.getUserRole();
    const userDepartment = await this.getUserDepartment();

    const response = await fetch(
        `https://api.yourcompany.com/outlook-templates?role=${userRole}&dept=${userDepartment}`
    );

    // Backend filters templates based on user context
    const config = await response.json();
    this.templates = config.templates;
}
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS for API endpoints
2. **Authentication**: Implement proper token-based authentication
3. **Authorization**: Verify user permissions on the backend
4. **Input Validation**: Sanitize all template content on the backend
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **CORS**: Configure CORS properly for your domain
7. **Secrets**: Never store API keys in client-side code

## Testing

Test your backend integration:

```javascript
// Add to your test suite
async function testBackendConnection() {
    const manager = new EmailTemplateManager();
    await manager.loadConfiguration();

    console.assert(manager.templates.length > 0, 'Templates loaded');
    console.assert(manager.settings.bccEmail, 'BCC email configured');
}
```

## Monitoring

Monitor your backend API:

- Response times
- Error rates
- Template load frequency
- User activity
- Cache hit rates

## Migration

To migrate from file-based to backend:

1. Keep `config/templates.json` as fallback
2. Deploy backend API
3. Update `loadConfiguration()` to try backend first
4. Test with a small user group
5. Monitor for issues
6. Roll out to all users
7. Eventually remove file-based fallback

## Support

For backend integration questions:
- Review Office.js authentication: https://docs.microsoft.com/en-us/office/dev/add-ins/develop/sso-in-office-add-ins
- Check CORS configuration
- Verify API response format matches expected structure

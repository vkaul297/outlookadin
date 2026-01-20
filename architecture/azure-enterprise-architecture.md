# Azure Enterprise Architecture - Detailed Diagrams

This document provides detailed architectural diagrams for the enterprise deployment.

## High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                          END USERS                                     │
│                                                                        │
│  Outlook Web    Outlook Desktop    Outlook Mobile    Office Apps     │
│     (OWA)          (Win/Mac)        (iOS/Android)                     │
└───────────┬────────────────┬───────────────┬──────────────────────────┘
            │                │               │
            │     HTTPS (TLS 1.3+)          │
            │                │               │
            └────────────────┴───────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    AZURE FRONT DOOR                                    │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Global CDN Edge Locations (150+ POPs worldwide)                │  │
│  │  - DDoS Protection (up to 100 Tbps)                             │  │
│  │  - Web Application Firewall (WAF)                               │  │
│  │  - Bot Protection                                                │  │
│  │  - Geo-filtering                                                 │  │
│  │  - Rate Limiting: 100 req/min/IP                                │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│              AZURE STATIC WEB APPS (Standard Tier)                    │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Authentication Layer (Built-in)                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  Entra ID (Azure AD) Authentication                       │  │  │
│  │  │  - Single Sign-On (SSO)                                   │  │  │
│  │  │  - Multi-Factor Authentication (MFA)                      │  │  │
│  │  │  - Conditional Access Policies                            │  │  │
│  │  │  - Role-Based Access Control (RBAC)                       │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │                                                                  │  │
│  │  Static Content (Global CDN)                                    │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  - manifest.xml                                           │  │  │
│  │  │  - taskpane.html, taskpane.css, taskpane.js             │  │  │
│  │  │  - assets/ (icons, images)                               │  │  │
│  │  │  - config/templates.json                                  │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │                                                                  │  │
│  │  Deployment Slots                                                │  │
│  │  - Production (main branch)                                      │  │
│  │  - Staging (automatic for PRs)                                   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   AZURE KEY VAULT        │    │  AZURE FUNCTIONS         │
│   (Premium Tier)         │    │  (Consumption/Premium)   │
│  ┌────────────────────┐  │    │  ┌────────────────────┐  │
│  │  Secrets Storage   │  │    │  │  Template API      │  │
│  │  - BCC Email       │  │    │  │  - CRUD Operations │  │
│  │  - Tracking Domain │  │    │  │  - Validation      │  │
│  │  - API Keys        │  │    │  │                    │  │
│  │  - Certificates    │  │    │  │  Analytics API     │  │
│  │                    │  │    │  │  - Track Usage     │  │
│  │  Managed Identities│  │    │  │  - Generate Reports│  │
│  │  - Function Apps   │  │    │  │                    │  │
│  │  - Static Web Apps │  │    │  │  Tracking Service  │  │
│  │                    │  │    │  │  - Email Opens     │  │
│  │  RBAC              │  │    │  │  - Click Tracking  │  │
│  │  - Key Access      │  │    │  │  - Conversation    │  │
│  │  - Secret Access   │  │    │  └────────────────────┘  │
│  └────────────────────┘  │    └──────────┬───────────────┘
└──────────────────────────┘               │
                                           ▼
                           ┌──────────────────────────┐
                           │  AZURE COSMOS DB         │
                           │  (Serverless)            │
                           │  ┌────────────────────┐  │
                           │  │  Collections:      │  │
                           │  │  - Templates       │  │
                           │  │  - UserPreferences │  │
                           │  │  - UsageAnalytics  │  │
                           │  │  - TrackingData    │  │
                           │  │  - AuditLogs       │  │
                           │  │                    │  │
                           │  │  Features:         │  │
                           │  │  - Point-in-time   │  │
                           │  │    restore         │  │
                           │  │  - Geo-replication │  │
                           │  │  - Auto-scaling    │  │
                           │  └────────────────────┘  │
                           └──────────────────────────┘

                    Monitoring & Security Layer
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Azure Monitor│    │ Log Analytics    │    │ Azure Sentinel   │
│              │    │ Workspace        │    │ (SIEM)           │
│ - Metrics    │    │                  │    │                  │
│ - Alerts     │    │ - Application    │    │ - Threat Intel   │
│ - Dashboards │    │   Insights       │    │ - Anomaly        │
│ - Workbooks  │    │ - Query Engine   │    │   Detection      │
│              │    │ - Retention:     │    │ - Incident Mgmt  │
│ Alert Rules: │    │   90 days        │    │ - Playbooks      │
│ - HTTP 5xx   │    │                  │    │ - Investigation  │
│ - Auth Fail  │    │ Log Types:       │    │                  │
│ - Latency    │    │ - Access Logs    │    │ Connectors:      │
│ - Errors     │    │ - Audit Logs     │    │ - Azure AD       │
└──────────────┘    │ - Security Logs  │    │ - Static Web App │
                    │ - Performance    │    │ - Functions      │
                    └──────────────────┘    └──────────────────┘
```

## Authentication Flow

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Access https://templates.yourcompany.com
       ▼
┌──────────────────────┐
│ Azure Static Web App │
└──────┬───────────────┘
       │
       │ 2. Check authentication
       ▼
┌──────────────────────┐
│ No valid session?    │
│ Redirect to login    │
└──────┬───────────────┘
       │
       │ 3. Redirect to /.auth/login/aad
       ▼
┌──────────────────────────────┐
│ Microsoft Entra ID           │
│ (Azure AD)                   │
└──────┬───────────────────────┘
       │
       │ 4. Present login page
       ▼
┌──────────────────────┐
│ User enters          │
│ credentials          │
└──────┬───────────────┘
       │
       │ 5. Submit credentials
       ▼
┌──────────────────────────────┐
│ Entra ID validates           │
│ - Username/password          │
│ - MFA (if required)          │
│ - Conditional Access         │
└──────┬───────────────────────┘
       │
       │ 6. Generate tokens
       │    - ID Token
       │    - Access Token
       │    - Refresh Token
       ▼
┌──────────────────────────────┐
│ Check user roles             │
│ - TemplateUser               │
│ - TemplateAdmin              │
└──────┬───────────────────────┘
       │
       │ 7. Return auth response
       ▼
┌──────────────────────────────┐
│ Azure Static Web App         │
│ - Set secure cookies         │
│ - Create session             │
└──────┬───────────────────────┘
       │
       │ 8. Redirect to app
       ▼
┌──────────────────────┐
│ User sees add-in     │
│ Templates loaded     │
└──────────────────────┘
```

## Data Flow - Template Insertion

```
User Action: Click "Insert Template"
        │
        ▼
┌────────────────────────────────────┐
│ JavaScript (taskpane.js)           │
│ 1. Validate all fields filled      │
│ 2. Replace placeholders            │
│ 3. Generate tracking code          │
│    Format: ST-INTRO-1234567890-ABC │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ Compose Email Body                 │
│ - HTML content                     │
│ - Tracking pixel:                  │
│   <img src="track...?code=XXX">   │
│ - Metadata div (invisible)         │
└────────────┬───────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────┐  ┌─────────────────┐
│ Office.js   │  │ Office.js       │
│ API Call:   │  │ API Call:       │
│ setSubject  │  │ setBody (HTML)  │
└─────────────┘  └─────────────────┘
    │                 │
    └────────┬────────┘
             ▼
┌────────────────────────────────────┐
│ Office.js API Call:                │
│ bcc.setAsync([{tracking@...}])     │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ Optional: Log to Analytics         │
│ POST /api/analytics/track          │
│ {                                  │
│   templateId: "sales-intro",       │
│   trackingCode: "ST-...",          │
│   userId: "user@company.com",      │
│   timestamp: "2026-01-20T..."      │
│ }                                  │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ Azure Functions                    │
│ Store in Cosmos DB                 │
│ - UsageAnalytics collection        │
└────────────┬───────────────────────┘
             │
             ▼
        ┌────────────┐
        │  Success!  │
        │ Email ready│
        │  to send   │
        └────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────────────────────────┐
│                    SECURITY DEFENSE IN DEPTH                    │
└────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
┌────────────────────────────────────────────────────────────────┐
│ Azure Front Door                                                │
│ ├─ DDoS Protection (up to 100 Tbps mitigation)                │
│ ├─ Geo-filtering (allow/block countries)                       │
│ ├─ IP ACLs (whitelist corporate IPs)                          │
│ └─ Rate Limiting (100 req/min per IP)                         │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Layer 2: Web Application Security
┌────────────────────────────────────────────────────────────────┐
│ Web Application Firewall (WAF)                                 │
│ ├─ OWASP Top 10 Protection                                     │
│ │  ├─ SQL Injection                                            │
│ │  ├─ XSS (Cross-Site Scripting)                              │
│ │  ├─ CSRF (Cross-Site Request Forgery)                       │
│ │  └─ Remote Code Execution                                   │
│ ├─ Bot Protection                                               │
│ ├─ Custom Rules                                                 │
│ └─ Threat Intelligence Feeds                                    │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Layer 3: Identity & Access Management
┌────────────────────────────────────────────────────────────────┐
│ Microsoft Entra ID (Azure AD)                                  │
│ ├─ Single Sign-On (SSO)                                        │
│ ├─ Multi-Factor Authentication (MFA)                           │
│ │  ├─ SMS/Phone Call                                           │
│ │  ├─ Microsoft Authenticator App                             │
│ │  ├─ Hardware tokens (FIDO2)                                 │
│ │  └─ Biometric (Windows Hello)                               │
│ ├─ Conditional Access Policies                                 │
│ │  ├─ Device compliance required                              │
│ │  ├─ Managed device required                                 │
│ │  ├─ Location-based access                                   │
│ │  ├─ Risk-based policies                                     │
│ │  └─ Application controls                                    │
│ └─ Privileged Identity Management (PIM)                        │
│    ├─ Just-In-Time access                                      │
│    ├─ Time-bound access                                        │
│    └─ Approval workflows                                       │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Layer 4: Authorization
┌────────────────────────────────────────────────────────────────┐
│ Role-Based Access Control (RBAC)                              │
│ ├─ TemplateUser                                                │
│ │  └─ Can: View & use templates                               │
│ ├─ TemplateAdmin                                               │
│ │  └─ Can: Create, edit, delete templates                     │
│ ├─ AnalyticsViewer                                             │
│ │  └─ Can: View usage reports                                 │
│ └─ SecurityAdmin                                                │
│    └─ Can: View audit logs, manage policies                   │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Layer 5: Application Security
┌────────────────────────────────────────────────────────────────┐
│ Secure Coding Practices                                        │
│ ├─ Input Validation                                            │
│ ├─ Output Encoding                                             │
│ ├─ Parameterized Queries                                       │
│ ├─ HTTPS Only (HSTS)                                           │
│ ├─ Secure Headers                                               │
│ │  ├─ X-Content-Type-Options: nosniff                         │
│ │  ├─ X-Frame-Options: DENY                                   │
│ │  ├─ X-XSS-Protection: 1; mode=block                         │
│ │  └─ Content-Security-Policy: strict                         │
│ └─ Secrets in Key Vault (never in code)                       │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Layer 6: Data Protection
┌────────────────────────────────────────────────────────────────┐
│ Encryption                                                      │
│ ├─ At Rest                                                      │
│ │  ├─ Azure Storage Service Encryption (AES-256)              │
│ │  ├─ Cosmos DB encryption                                     │
│ │  └─ Customer-managed keys (optional)                         │
│ ├─ In Transit                                                   │
│ │  ├─ TLS 1.2+ only                                            │
│ │  ├─ Perfect Forward Secrecy                                 │
│ │  └─ Strong cipher suites                                    │
│ └─ Client-Side                                                  │
│    └─ Sensitive data encrypted before transmission            │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
Layer 7: Monitoring & Response
┌────────────────────────────────────────────────────────────────┐
│ Security Information & Event Management (SIEM)                 │
│ ├─ Azure Sentinel                                               │
│ │  ├─ Real-time threat detection                              │
│ │  ├─ Machine learning anomaly detection                      │
│ │  ├─ Automated incident response                             │
│ │  └─ Threat intelligence integration                         │
│ ├─ Log Analytics                                                │
│ │  ├─ Centralized log collection                              │
│ │  ├─ 90-day retention                                         │
│ │  └─ Advanced query capabilities                             │
│ └─ Alerts & Notifications                                       │
│    ├─ Email notifications                                      │
│    ├─ Microsoft Teams integration                             │
│    ├─ PagerDuty integration                                   │
│    └─ Custom webhooks                                          │
└────────────────────────────────────────────────────────────────┘
```

## Compliance & Audit Trail

```
User Action → Captured Event → Stored in Log Analytics → Analyzed by Sentinel

Example Events:

1. User Login
   ┌─────────────────────────────────────────┐
   │ Event: user.login.success               │
   │ User: john.doe@company.com              │
   │ Timestamp: 2026-01-20T10:30:00Z        │
   │ IP: 203.0.113.42                        │
   │ Location: New York, US                  │
   │ Device: Windows 11, Compliant           │
   │ MFA: Authenticator App                  │
   │ Risk Level: Low                         │
   └─────────────────────────────────────────┘

2. Template Inserted
   ┌─────────────────────────────────────────┐
   │ Event: template.inserted                │
   │ User: john.doe@company.com              │
   │ Template: sales-intro                   │
   │ Tracking Code: ST-INTRO-1234567890-ABC  │
   │ Timestamp: 2026-01-20T10:35:00Z        │
   │ BCC: tracking@company.com               │
   │ Placeholders Filled: 8/8                │
   └─────────────────────────────────────────┘

3. Configuration Change
   ┌─────────────────────────────────────────┐
   │ Event: configuration.changed            │
   │ User: admin@company.com                 │
   │ Role: TemplateAdmin                     │
   │ Action: Template created                │
   │ Template ID: new-template-001           │
   │ Timestamp: 2026-01-20T11:00:00Z        │
   │ Approval: Required (pending)            │
   └─────────────────────────────────────────┘

4. Security Violation
   ┌─────────────────────────────────────────┐
   │ Event: security.violation.detected      │
   │ Type: Excessive failed logins           │
   │ Source IP: 198.51.100.99                │
   │ Attempts: 15 in 5 minutes               │
   │ Timestamp: 2026-01-20T11:15:00Z        │
   │ Action: IP blocked for 1 hour           │
   │ Notification: Security team alerted     │
   └─────────────────────────────────────────┘

Retention:
- Hot tier (0-30 days): Immediate access
- Warm tier (31-90 days): Standard access
- Archive (90+ days): Long-term compliance
```

## Disaster Recovery Architecture

```
Primary Region: East US                    Secondary Region: West US 2
┌─────────────────────────┐               ┌─────────────────────────┐
│ Azure Static Web App    │◄─────────────►│ Azure Static Web App    │
│ (Active)                │   Geo-Repl.   │ (Standby)               │
└────────┬────────────────┘               └────────┬────────────────┘
         │                                          │
         │                                          │
┌────────┴────────────────┐               ┌────────┴────────────────┐
│ Cosmos DB               │◄─────────────►│ Cosmos DB               │
│ (Read/Write)            │  Multi-Region │ (Read/Write)            │
│                         │  Replication  │                         │
└─────────────────────────┘               └─────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Azure Traffic Manager                          │
│  - Health Checks every 30 seconds                                │
│  - Automatic failover on failure                                 │
│  - Priority routing: Primary → Secondary                         │
└──────────────────────────────────────────────────────────────────┘

Failover Scenarios:

1. Primary Region Outage
   - Traffic Manager detects health check failure
   - Automatically routes to secondary region
   - RTO: < 5 minutes
   - RPO: < 1 minute (Cosmos DB replication)

2. Application Error
   - Monitoring detects high error rate
   - Manual or automated failover triggered
   - Diagnostic logs preserved
   - Rollback capability maintained

3. Planned Maintenance
   - Schedule announced 7 days in advance
   - Blue-green deployment to secondary
   - Zero-downtime cutover
   - Verification testing before primary update
```

---

## Quick Reference - Azure Resources

| Resource | Purpose | Tier | Monthly Cost |
|----------|---------|------|--------------|
| Azure Static Web Apps | Host add-in files | Standard | $9 |
| Azure Front Door | CDN + WAF | Premium | $35 + data |
| Entra ID Premium | Authentication | P1 | $6/user |
| Azure Monitor | Metrics & alerts | Pay-as-you-go | $10-50 |
| Log Analytics | Log aggregation | Pay-as-you-go | $2-20 |
| Azure Key Vault | Secrets management | Standard | <$1 |
| Azure Functions* | Backend APIs | Consumption | $0-20 |
| Cosmos DB* | Database | Serverless | $0-100 |

*Optional services

Total: **$100-300/month** for typical enterprise deployment

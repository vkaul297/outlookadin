/* global Office */

// Template Manager Class
class EmailTemplateManager {
    constructor() {
        this.templates = [];
        this.settings = {};
        this.currentTemplate = null;
        this.placeholderValues = {};
    }

    // Initialize the add-in
    async initialize() {
        try {
            await this.loadConfiguration();
            this.setupEventListeners();
            this.updateBCCStatus();
            this.populateTemplateDropdown();
        } catch (error) {
            this.showStatus('Error initializing add-in: ' + error.message, 'error');
        }
    }

    // Load configuration from JSON file or backend service
    async loadConfiguration() {
        try {
            // For local development, load from config file
            const response = await fetch('../../config/templates.json');
            if (!response.ok) {
                throw new Error('Failed to load configuration');
            }
            const config = await response.json();
            this.templates = config.templates || [];
            this.settings = config.settings || {};
        } catch (error) {
            // Fallback: Use default configuration if file not found
            console.error('Configuration load error:', error);
            this.loadDefaultConfiguration();
        }
    }

    // Fallback default configuration
    loadDefaultConfiguration() {
        this.settings = {
            bccEmail: 'tracking@yourcompany.com',
            trackingDomain: 'track.yourcompany.com'
        };
        this.templates = [];
        this.showStatus('Using default configuration. Please configure your templates.', 'info');
    }

    // Setup event listeners
    setupEventListeners() {
        const jobFunctionFilter = document.getElementById('jobFunction');
        const templateSelect = document.getElementById('templateSelect');
        const insertBtn = document.getElementById('insertBtn');
        const resetBtn = document.getElementById('resetBtn');

        jobFunctionFilter.addEventListener('change', () => this.filterTemplates());
        templateSelect.addEventListener('change', () => this.onTemplateSelected());
        insertBtn.addEventListener('click', () => this.insertTemplate());
        resetBtn.addEventListener('click', () => this.resetForm());

        // Add input listeners for live preview
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('template-field')) {
                this.updatePreview();
            }
        });
    }

    // Update BCC status display
    updateBCCStatus() {
        const bccEmailElement = document.getElementById('bccEmail');
        if (this.settings.bccEmail) {
            bccEmailElement.textContent = this.settings.bccEmail;
            bccEmailElement.style.color = '#107c10';
        } else {
            bccEmailElement.textContent = 'Not configured';
            bccEmailElement.style.color = '#a80000';
        }
    }

    // Filter templates based on job function
    filterTemplates() {
        const selectedFunction = document.getElementById('jobFunction').value;
        let filteredTemplates = this.templates;

        if (selectedFunction) {
            filteredTemplates = this.templates.filter(t => t.jobFunction === selectedFunction);
        }

        this.populateTemplateDropdown(filteredTemplates);
    }

    // Populate template dropdown
    populateTemplateDropdown(templates = this.templates) {
        const templateSelect = document.getElementById('templateSelect');
        templateSelect.innerHTML = '<option value="">-- Choose a template --</option>';

        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = `${template.name} (${template.jobFunction})`;
            templateSelect.appendChild(option);
        });
    }

    // Handle template selection
    onTemplateSelected() {
        const templateId = document.getElementById('templateSelect').value;
        const templateDetails = document.getElementById('templateDetails');

        if (!templateId) {
            templateDetails.style.display = 'none';
            this.currentTemplate = null;
            return;
        }

        this.currentTemplate = this.templates.find(t => t.id === templateId);
        if (this.currentTemplate) {
            this.displayTemplateDetails();
            templateDetails.style.display = 'block';
        }
    }

    // Display template details and create dynamic fields
    displayTemplateDetails() {
        document.getElementById('templateName').textContent = this.currentTemplate.name;
        document.getElementById('trackingCode').textContent = this.currentTemplate.trackingCode;

        // Extract placeholders from subject and body
        const placeholders = this.extractPlaceholders(
            this.currentTemplate.subject + ' ' + this.currentTemplate.body
        );

        // Create dynamic input fields
        this.createDynamicFields(placeholders);

        // Update preview
        this.updatePreview();
    }

    // Extract placeholders from text ({{placeholder}})
    extractPlaceholders(text) {
        const regex = /{{(\w+)}}/g;
        const placeholders = new Set();
        let match;

        while ((match = regex.exec(text)) !== null) {
            placeholders.add(match[1]);
        }

        return Array.from(placeholders);
    }

    // Create dynamic input fields for placeholders
    createDynamicFields(placeholders) {
        const container = document.getElementById('dynamicFields');
        container.innerHTML = '';
        this.placeholderValues = {};

        placeholders.forEach(placeholder => {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'field-group';

            const label = document.createElement('label');
            label.textContent = this.formatPlaceholderLabel(placeholder);
            label.setAttribute('for', `field-${placeholder}`);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `field-${placeholder}`;
            input.className = 'template-field';
            input.dataset.placeholder = placeholder;
            input.placeholder = `Enter ${this.formatPlaceholderLabel(placeholder).toLowerCase()}`;

            fieldGroup.appendChild(label);
            fieldGroup.appendChild(input);
            container.appendChild(fieldGroup);

            this.placeholderValues[placeholder] = '';
        });
    }

    // Format placeholder name for display
    formatPlaceholderLabel(placeholder) {
        // Convert camelCase to Title Case
        return placeholder
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    // Update preview with current values
    updatePreview() {
        if (!this.currentTemplate) return;

        // Collect current field values
        const fields = document.querySelectorAll('.template-field');
        fields.forEach(field => {
            this.placeholderValues[field.dataset.placeholder] = field.value;
        });

        // Replace placeholders in subject and body
        const subject = this.replacePlaceholders(this.currentTemplate.subject);
        const body = this.replacePlaceholders(this.currentTemplate.body);

        // Update preview
        document.getElementById('previewSubject').textContent = subject;
        document.getElementById('previewBody').innerHTML = body;
    }

    // Replace placeholders with actual values
    replacePlaceholders(text) {
        let result = text;
        Object.keys(this.placeholderValues).forEach(placeholder => {
            const regex = new RegExp(`{{${placeholder}}}`, 'g');
            const value = this.placeholderValues[placeholder] || `{{${placeholder}}}`;
            result = result.replace(regex, value);
        });
        return result;
    }

    // Generate unique tracking code
    generateTrackingCode(templateCode) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${templateCode}-${timestamp}-${random}`;
    }

    // Create invisible tracking pixel
    createTrackingPixel(trackingCode) {
        const trackingUrl = `https://${this.settings.trackingDomain}/track.gif?code=${trackingCode}`;
        return `<img src="${trackingUrl}" width="1" height="1" style="display:none;opacity:0;position:absolute;" alt="" />`;
    }

    // Create invisible tracking div with metadata
    createTrackingMetadata(trackingCode, templateId) {
        return `<div style="display:none;visibility:hidden;font-size:0;line-height:0;" data-template-id="${templateId}" data-tracking-code="${trackingCode}"><!-- ${trackingCode} --></div>`;
    }

    // Insert template into email
    async insertTemplate() {
        if (!this.currentTemplate) {
            this.showStatus('Please select a template first', 'error');
            return;
        }

        // Validate that all required fields are filled
        const emptyFields = Object.entries(this.placeholderValues)
            .filter(([key, value]) => !value)
            .map(([key]) => this.formatPlaceholderLabel(key));

        if (emptyFields.length > 0) {
            this.showStatus(`Please fill in all fields: ${emptyFields.join(', ')}`, 'error');
            return;
        }

        try {
            await Office.context.mailbox.item.body.setAsync(
                'Loading template...',
                { coercionType: Office.CoercionType.Text }
            );

            const subject = this.replacePlaceholders(this.currentTemplate.subject);
            const body = this.replacePlaceholders(this.currentTemplate.body);

            // Generate unique tracking code
            const trackingCode = this.generateTrackingCode(this.currentTemplate.trackingCode);

            // Add tracking pixel and metadata
            const trackingPixel = this.createTrackingPixel(trackingCode);
            const trackingMetadata = this.createTrackingMetadata(trackingCode, this.currentTemplate.id);
            const fullBody = body + trackingPixel + trackingMetadata;

            // Set subject
            await this.setSubject(subject);

            // Set body with tracking
            await this.setBody(fullBody);

            // Add BCC
            if (this.settings.bccEmail) {
                await this.addBCC(this.settings.bccEmail);
            }

            this.showStatus('Template inserted successfully!', 'success');

            // Log tracking code for reference
            console.log('Tracking Code:', trackingCode);

        } catch (error) {
            this.showStatus('Error inserting template: ' + error.message, 'error');
            console.error('Insert error:', error);
        }
    }

    // Set email subject
    setSubject(subject) {
        return new Promise((resolve, reject) => {
            Office.context.mailbox.item.subject.setAsync(subject, (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve();
                } else {
                    reject(new Error('Failed to set subject: ' + result.error.message));
                }
            });
        });
    }

    // Set email body
    setBody(body) {
        return new Promise((resolve, reject) => {
            Office.context.mailbox.item.body.setAsync(
                body,
                { coercionType: Office.CoercionType.Html },
                (result) => {
                    if (result.status === Office.AsyncResultStatus.Succeeded) {
                        resolve();
                    } else {
                        reject(new Error('Failed to set body: ' + result.error.message));
                    }
                }
            );
        });
    }

    // Add BCC recipient
    addBCC(email) {
        return new Promise((resolve, reject) => {
            // Check if BCC is supported (Outlook 2013+ and Outlook on the web)
            if (Office.context.mailbox.item.bcc) {
                Office.context.mailbox.item.bcc.setAsync(
                    [{ emailAddress: email }],
                    (result) => {
                        if (result.status === Office.AsyncResultStatus.Succeeded) {
                            console.log('BCC added:', email);
                            resolve();
                        } else {
                            reject(new Error('Failed to add BCC: ' + result.error.message));
                        }
                    }
                );
            } else {
                // Fallback for older Outlook versions
                console.warn('BCC not supported in this version of Outlook');
                resolve(); // Don't fail the entire operation
            }
        });
    }

    // Reset form
    resetForm() {
        document.getElementById('templateSelect').value = '';
        document.getElementById('jobFunction').value = '';
        document.getElementById('templateDetails').style.display = 'none';
        this.currentTemplate = null;
        this.placeholderValues = {};
        this.populateTemplateDropdown();
        this.showStatus('Form reset', 'info');
    }

    // Show status message
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// Initialize when Office is ready
Office.onReady((info) => {
    if (info.host === Office.HostType.Outlook) {
        const manager = new EmailTemplateManager();
        manager.initialize();
    }
});

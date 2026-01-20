# Assets Directory

This directory contains icons and images for the Outlook add-in.

## Required Icons

The add-in requires the following icon sizes:

- `icon-16.png` - 16x16 pixels (ribbon icon, small)
- `icon-32.png` - 32x32 pixels (ribbon icon, medium)
- `icon-64.png` - 64x64 pixels (add-in store, high-res)
- `icon-80.png` - 80x80 pixels (ribbon icon, large)

## Icon Guidelines

### Design Requirements
- **Format**: PNG with transparent background
- **Style**: Simple, flat design that works at small sizes
- **Colors**: Use your brand colors, ensure good contrast
- **Content**: Recognizable symbol (e.g., envelope, template, document)

### Example Icon Ideas
- Email envelope with a template/document icon
- Letter 'T' for Template
- Stack of papers/documents
- Email with gear/settings icon

## Creating Icons

You can create icons using:

1. **Online Tools**:
   - [Canva](https://www.canva.com) - Free design tool
   - [Figma](https://www.figma.com) - Professional design tool
   - [IconScout](https://iconscout.com) - Icon library

2. **Design Software**:
   - Adobe Illustrator
   - Sketch
   - Affinity Designer

3. **Simple Placeholders** (for testing):
   Create colored squares with text using any image editor

## Installation

Place your icon files in this directory with the exact names:
```
assets/
├── icon-16.png
├── icon-32.png
├── icon-64.png
└── icon-80.png
```

The manifest.xml file references these icons automatically.

## Temporary Development Icons

For development/testing, you can use simple placeholder images. The add-in will work without icons, but they improve the user experience.

## Production Icons

For production deployment, ensure you have professional icons that:
- Match your brand guidelines
- Are easily recognizable
- Scale well at different sizes
- Have proper licensing

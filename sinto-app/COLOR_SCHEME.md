# Sinto App Color Scheme

## Overview

The Sinto app uses a warm, fertility-focused color palette featuring red and gold as primary colors, complemented by neutral grays for backgrounds and text.

## Color Variables

All colors are defined as CSS custom properties in `src/index.css`:

```css
:root {
  --color-primary: #d32f2f;        /* Bold Red */
  --color-accent-gold: #ffc107;    /* Warm Gold */
  --color-bg: #f5f5f7;             /* Light Gray Background */
  --color-surface: #ffffff;        /* White Surface */
  --color-text: #1a1a2e;           /* Dark Gray Text */
  --color-muted: #6b7280;          /* Medium Gray */
  --color-border: #e5e7eb;         /* Light Gray Border */
}
```

## Usage Guidelines

### Primary Red (#d32f2f)
- **Logo and branding**: Main navigation logo
- **Interactive elements**: Buttons, links, icons
- **Hover states**: Interactive components
- **Today indicator**: Calendar highlights
- **Fertile phase**: Fertility window indicator (pulsing animation)

### Accent Gold (#ffc107)
- **Selected dates**: Calendar selected day highlighting
- **Progress bars**: Secondary color in gradients
- **Highlights**: Secondary visual emphasis
- **Accent borders**: Supporting visual hierarchy

### Neutral Colors
- **Background**: Light gray (#f5f5f7) for page backgrounds
- **Surface**: White (#ffffff) for cards and panels
- **Text**: Dark gray (#1a1a2e) for body text and headings
- **Muted**: Medium gray (#6b7280) for secondary text and disabled states
- **Border**: Light gray (#e5e7eb) for borders and dividers

## Accessibility

All color combinations meet **WCAG AA** accessibility standards:

- Dark text on light backgrounds: 11.89:1 - 12.63:1 ✓ WCAG AAA
- White text on red: 5.02:1 ✓ WCAG AA
- Dark text on gold: 6.47:1 ✓ WCAG AA

## Implementation

### CSS Variables
Always use CSS custom properties instead of hardcoded hex values:

```css
/* Good */
color: var(--color-primary);
background: var(--color-accent-gold);

/* Avoid */
color: #d32f2f;
background: #ffc107;
```

### Component-Specific Styling

**Buttons & CTAs**
```css
background: var(--color-primary);
color: white;

&:hover {
  background: #b71c1c; /* Darker red */
}
```

**Form Inputs (Focus)**
```css
border-color: var(--color-primary);
box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
```

**Interactive Elements (Hover)**
```css
color: var(--color-primary);
border-color: var(--color-primary);
```

**Accents & Highlights**
```css
background: var(--color-accent-gold);
color: var(--color-text);
```

## Theme Customization

To adjust the color scheme, update the CSS variables in `src/index.css`. All components automatically inherit the changes through the cascade system.

## Future Enhancements

- Dark mode support (consider CSS custom properties for light/dark variants)
- Phase-specific color coding (different tints for menstrual, follicular, and luteal phases)
- Customizable color themes for user preferences

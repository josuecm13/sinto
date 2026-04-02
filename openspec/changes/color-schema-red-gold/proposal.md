## Why

The current purple-based color scheme lacks the warmth and vitality needed for a health-focused fertility tracking application. Red and gold evoke warmth, fertility, abundance, and positive energy—aligning the visual identity with the app's purpose of tracking and celebrating reproductive health cycles. This change enhances the user's emotional connection to the app and improves brand consistency.

## What Changes

- **Primary color**: Purple (#7c3aed) → Bold red (#d32f2f or similar)
- **Accent color**: Introduce warm gold (#ffc107 or similar) for highlights, icons, and complementary UI elements
- **Secondary colors**: Derive a cohesive palette supporting red and gold while maintaining contrast and accessibility
- **Color variables**: Update CSS custom properties in index.css and propagate changes throughout all components
- **Visual consistency**: Ensure red/gold are applied to interactive elements, phase indicators, chart highlights, and key UI patterns

## Capabilities

### New Capabilities

- `color-theme-red-gold`: A complete red and gold color theme replacing the purple scheme, providing a warm, fertility-focused visual identity

### Modified Capabilities

<!-- No existing specs yet -->

## Impact

- **Code files**: sinto-app/src/index.css (color variables), all .module.css files, any inline styles
- **User-facing**: All pages, components, cards, buttons, charts, calendar visualization, phase indicators
- **Accessibility**: Must verify WCAG AA contrast ratios for all text on colored backgrounds
- **No breaking changes**: This is purely a visual update; no functional or API changes

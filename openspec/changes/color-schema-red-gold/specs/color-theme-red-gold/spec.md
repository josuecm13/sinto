## ADDED Requirements

### Requirement: Red and Gold Color Palette
The system SHALL use a warm red and gold color palette to replace the purple theme. The palette SHALL consist of:
- **Primary Red**: #d32f2f (used for primary actions, buttons, interactive elements)
- **Accent Gold**: #ffc107 (used for secondary highlights, icons, accents)
- **Supporting Neutrals**: Unchanged gray, white, and dark text colors for backgrounds and text

#### Scenario: Primary color appears on CTAs and icons
- **WHEN** a user views the app interface
- **THEN** primary call-to-action buttons, logo, and interactive elements display the primary red (#d32f2f)

#### Scenario: Gold accent highlights secondary elements
- **WHEN** a user views calendar highlights, phase indicators, or secondary icons
- **THEN** gold (#ffc107) is used as an accent color for visual emphasis

#### Scenario: Color consistency across all pages
- **WHEN** a user navigates between MainPage, RegisterPage, LoginPage, SettingsPage, and modals
- **THEN** the red and gold palette is applied consistently across all pages and components

### Requirement: WCAG AA Contrast Compliance
The system SHALL meet WCAG AA contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text) for all text rendered on colored backgrounds.

#### Scenario: Dark text on light backgrounds maintains contrast
- **WHEN** dark text (#1a1a2e) is rendered on light backgrounds (white or light gray)
- **THEN** contrast ratio is at least 4.5:1

#### Scenario: Light text on red background maintains contrast
- **WHEN** light text (white or light gray) is rendered on the red (#d32f2f) background
- **THEN** contrast ratio is at least 4.5:1

#### Scenario: Dark text on gold background maintains contrast
- **WHEN** dark text (#1a1a2e) is rendered on the gold (#ffc107) background
- **THEN** contrast ratio is at least 4.5:1

### Requirement: Color Variable Implementation
The system SHALL define color variables in CSS that represent the red and gold theme, allowing components to reference these variables rather than hardcoded hex values.

#### Scenario: CSS variables are defined for primary colors
- **WHEN** the stylesheet loads
- **THEN** `--color-primary` is defined as #d32f2f and `--color-accent-gold` is defined as #ffc107

#### Scenario: All components reference color variables
- **WHEN** a component applies color styling
- **THEN** the component uses `var(--color-primary)` or `var(--color-accent-gold)` instead of hardcoded hex values

### Requirement: Fertility Phase Color Coding
The system SHALL apply red and gold colors to visual representations of fertility phases to reinforce the health and abundance theme.

#### Scenario: Follicular phase uses cool tones
- **WHEN** a user views the calendar or phase card for the follicular phase
- **THEN** it is visually distinguished from other phases (may use a muted red or cool gold)

#### Scenario: Luteal phase uses warm tones
- **WHEN** a user views the calendar or phase card for the luteal phase
- **THEN** it is visually distinguished using warm gold or deep red accents

#### Scenario: Menstruation phase uses bold red
- **WHEN** a user views the calendar or phase card for menstruation
- **THEN** it is visually distinguished using bold red (#d32f2f) to indicate this phase

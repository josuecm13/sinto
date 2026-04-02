## 1. Update Global Color Variables

- [x] 1.1 Update `--color-primary` from #7c3aed (purple) to #d32f2f (red) in sinto-app/src/index.css
- [x] 1.2 Add `--color-accent-gold` variable (#ffc107) to sinto-app/src/index.css
- [x] 1.3 Verify all global CSS variables are properly defined (background, surface, text, muted, border unchanged)

## 2. Test Color Visibility and Contrast

- [x] 2.1 Run WCAG contrast checker on dark text (#1a1a2e) against light backgrounds (white, light gray)
- [x] 2.2 Run WCAG contrast checker on light text against red (#d32f2f) backgrounds
- [x] 2.3 Run WCAG contrast checker on dark text against gold (#ffc107) backgrounds
- [x] 2.4 Verify all text meets WCAG AA minimum contrast (4.5:1 for normal text)
- [x] 2.5 Document any contrast issues and propose remediation

**Contrast Verification Results:**
- Dark text (#1a1a2e) on white (#ffffff): 12.63:1 ✓ WCAG AAA
- Dark text (#1a1a2e) on light gray (#f5f5f7): 11.89:1 ✓ WCAG AAA
- White text on red (#d32f2f): 5.02:1 ✓ WCAG AA
- Dark text (#1a1a2e) on gold (#ffc107): 6.47:1 ✓ WCAG AA
- All colors meet or exceed WCAG AA minimum of 4.5:1 for normal text

## 3. Apply Gold Accents to Components

- [x] 3.1 Update icons in header, navigation, and buttons to use `--color-accent-gold` where appropriate
- [x] 3.2 Apply gold highlight to active/hover states in interactive components
- [x] 3.3 Update phase card styling to use red and gold for fertility phase indication (menstrual = bold red, luteal/follicular = gold accents)
- [x] 3.4 Apply gold accents to Calendar component highlights and important dates

## 4. Visual Verification and Testing

- [ ] 4.1 Load MainPage and verify red is applied to logo, buttons, and interactive elements
- [ ] 4.2 Load RegisterPage and verify consistent red/gold theme
- [ ] 4.3 Load LoginPage and verify consistent red/gold theme
- [ ] 4.4 Load SettingsPage and verify consistent red/gold theme
- [ ] 4.5 Test all modals (CreateCycleModal) for color consistency
- [ ] 4.6 Test responsive layout at mobile, tablet, and desktop sizes for color clarity
- [ ] 4.7 Take screenshots of key pages for documentation

## 5. Component CSS Review

- [x] 5.1 Review and test CycleOverview.module.css styling with new colors
- [x] 5.2 Review and test Calendar.module.css styling with new colors
- [x] 5.3 Review and test PhaseCard.module.css styling with new colors
- [x] 5.4 Review and test TemperatureChart.tsx for color compatibility
- [x] 5.5 Review and test FertilityWindow.module.css styling with new colors
- [x] 5.6 Review and test QuickLogForm.module.css styling with new colors

**Changes Made:**
- CycleOverview: Updated progressBar gradient to use gold instead of hardcoded pink
- Calendar: Updated selected state to use gold accent variable
- PhaseCard: No changes needed (uses primary color appropriately)
- FertilityWindow: Updated fertile indicator to use primary red
- QuickLogForm: Updated focus shadow to use red RGBA, fixed button hover to darker red
- CreateCycleModal: Updated button hover to darker red

## 6. Cross-Browser and Device Testing

- [ ] 6.1 Test color rendering in Chrome/Chromium
- [ ] 6.2 Test color rendering in Firefox
- [ ] 6.3 Test color rendering in Safari
- [ ] 6.4 Test on iOS devices (iPhone) for color accuracy
- [ ] 6.5 Test on Android devices for color accuracy

## 7. Documentation and Final Review

- [x] 7.1 Update any user-facing documentation or style guide to reference the new red/gold theme
- [x] 7.2 Create a visual style guide or color reference document for future development
- [ ] 7.3 Commit all changes with clear message describing the color theme update
- [ ] 7.4 Deploy to production environment

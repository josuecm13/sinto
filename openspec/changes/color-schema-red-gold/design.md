## Context

The Sinto app currently uses a purple-based color scheme defined as CSS custom properties in `sinto-app/src/index.css`. All components use these variables (e.g., `var(--color-primary)`) rather than hardcoded colors, making a global theme change tractable.

Current colors:
- Primary: #7c3aed (purple)
- Background: #f5f5f7 (light gray)
- Surface: #ffffff (white)
- Text: #1a1a2e (dark gray)
- Muted: #6b7280 (medium gray)
- Border: #e5e7eb (light gray)

All .module.css files reference these variables, ensuring consistent propagation when the root variables are updated.

## Goals / Non-Goals

**Goals:**
- Replace purple primary with a bold red (#d32f2f recommended)
- Introduce a warm gold accent (#ffc107 recommended) for secondary highlights
- Ensure WCAG AA contrast compliance across all text + background combinations
- Maintain the existing component architecture and styling patterns
- Apply color changes uniformly across all pages and components

**Non-Goals:**
- Redesign component layouts or structure
- Modify component logic or functionality
- Update typography or spacing
- Introduce new interactive states or animations

## Decisions

1. **Color Variable Strategy**
   - Decision: Introduce new CSS variables `--color-red` and `--color-gold` alongside existing variables; redefine `--color-primary` as the red.
   - Rationale: This allows incremental updates; some components can reference `--color-primary` while others can use `--color-gold` for accents. Easier to rollback if needed.
   - Alternative: Replace all hardcoded references in CSS immediately. Would require more files touched at once.

2. **Red and Gold Palette Selection**
   - Decision: Use #d32f2f (Material Design red 700) and #ffc107 (Material Design amber 500) as base colors.
   - Rationale: Both have strong WCAG contrast against white and light gray; widely tested and accessible.
   - Alternative: Custom hex values; however, Material Design colors are battle-tested.

3. **Contrast Verification**
   - Decision: Run WCAG contrast checks on all text pairs (red/gold on white, light gray, dark text on red/gold backgrounds).
   - Rationale: Ensures accessibility compliance and readable UI.
   - Alternative: Manual spot-checking; less reliable and incomplete.

4. **Deployment Approach**
   - Decision: Update `index.css` variables first, then verify visually across all pages; no separate feature flag needed.
   - Rationale: Color changes are non-breaking; users expect visual consistency across the app.
   - Alternative: Feature flag per component; adds complexity without benefit for a color theme.

## Risks / Trade-offs

[Risk: Contrast failure] → Mitigation: Test all text on colored backgrounds before shipping. Use WebAIM or similar tool to verify.

[Risk: Red may feel too intense] → Mitigation: If bold red is jarring, soften to a slightly lighter shade (e.g., #e53935 or #d32f2f with lower opacity in highlights).

[Risk: Gold overuse could appear tacky] → Mitigation: Use gold sparingly—for icons, accents, and highlights only. Avoid gold backgrounds with dark text.

## Migration Plan

1. Update CSS variables in `sinto-app/src/index.css`
2. Review color application across all component files (Calendar, PhaseCard, CycleOverview, etc.)
3. Test contrast and visual appearance on MainPage, RegisterPage, LoginPage, SettingsPage
4. Deploy to production; no rollback branch needed (revert CSS variables if issues arise)

## Open Questions

- Exact shade of red and gold? (Recommend Material Design colors but user approval helpful)
- Should accent gold be applied to buttons, icons, borders, or all of the above?
- Any specific components where red/gold should be toned down or avoided?

# The Design Gauntlet Recipe

> **Composite Multi-Agent Workflow:** `vxnt:design-crit` ➔ `vxnt:empathy-a11y` ➔ `vxnt:design-system`  
> **Target:** UI Components, Web Pages, Screen Mockups, Tailwind/CSS Markup.

---

## Workflow Objective
The Design Gauntlet transforms rough or unrefined UI into production-grade, accessible, design-system-aligned interfaces:
1. **Tier 1 (`vxnt:design-crit`):** Evaluates visual hierarchy, spatial rhythm, typography scale, and focal points.
2. **Tier 2 (`vxnt:empathy-a11y`):** Stress-tests keyboard navigation, screen reader affordances, contrast ratios, and edge states (empty/error/slow loading).
3. **Tier 3 (`vxnt:design-system`):** Normalizes all custom values, replaces ad-hoc HTML with reusable components, and enforces design tokens.

```mermaid
flowchart LR
    A[Input UI / Markup] --> B[1. Design Critic (vxnt:design-crit)]
    B -->|Visual Hierarchy & Rhythm| C[2. Empathy & A11y (vxnt:empathy-a11y)]
    C -->|WCAG & Edge States| D[3. Design System (vxnt:design-system)]
    D -->|Tokens & Reusable Primitives| E[Production-Ready UI]
```

---

## Token Efficiency Directive (`vxnt:token-economist`)
> **Context Control:** Pass only the target component subtree and relevant Tailwind/CSS tokens—do not dump global stylesheets or unpruned parent pages.

---

## Step-by-Step Invocation Protocol

### Step 1: Visual & Spatial Critique
Run the `vxnt:design-crit` skill on the UI component or page:
```
/vxnt:design-crit
<paste UI markup or describe layout>
```
*Goal:* Fix competing visual weights, inconsistent margins/paddings, and weak typography scales.

### Step 2: Inclusivity & Edge State Stress-Test
Pass the visually refined component to `vxnt:empathy-a11y`:
```
/vxnt:empathy-a11y
<paste updated UI markup>
```
*Goal:* Add missing ARIA attributes, ensure keyboard tab order, verify 4.5:1 contrast, and design empty/error states.

### Step 3: Design System Token Normalization
Pass the accessible markup to `vxnt:design-system`:
```
/vxnt:design-system
<paste accessible markup>
```
*Goal:* Replace arbitrary hex codes `#2563EB` and pixel values with standard tokens (`primary-600`, `spacing-4`), and replace raw `div` buttons with design system component primitives.

---

## Automated Gauntlet Prompt (For Single-Prompt LLM Execution)

If running in a single web prompt or non-agentic LLM, paste this prompt:

```markdown
Run the **Design Gauntlet** on the following UI markup. Execute three passes in order:

PASS 1 - VISUAL HIERARCHY & RHYTHM (design-crit):
- Audit visual hierarchy, scan paths, 4px/8px spatial rhythm, and typography scale.
- Provide concrete visual and CSS adjustments.

PASS 2 - ACCESSIBILITY & EDGE STATES (empathy-a11y):
- Audit WCAG 2.2 AA contrast, keyboard accessibility (tabIndex, keyboard listeners), ARIA semantics, and empty/error states.
- Provide accessibility remediation diffs.

PASS 3 - SYSTEM TOKENS & REUSABILITY (design-system):
- Replace all magic numbers, arbitrary hex colors, and custom styles with standard design tokens.
- Replace ad-hoc elements with standard design system component primitives.

FINAL DELIVERABLE:
1. Combined Design Scorecard Matrix.
2. The final, consolidated, accessible, and tokenized UI component markup.

---
UI MARKUP TO REVIEW:
<paste your markup here>
```

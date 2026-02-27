---
name: ui-development
description: Guidelines for building the high-fidelity UI of BestMatch using Next.js 15, Shadcn UI, and Framer Motion.
---

# UI Development Skill

This skill ensures that all UI components built for BestMatch adhere to the premium design standards defined in the project prototype.

## Core Design System

### Color Palette (from design/prototype_bestmatch.jsx)
| Token | HEX | Usage |
| :--- | :--- | :--- |
| `bg` | `#f8fafc` | Main background |
| `surface` | `#ffffff` | Card and modal backgrounds |
| `border` | `#e2e8f0` | Subtle borders |
| `accent` | `#0ea5e9` | Primary action color |
| `green` | `#10b981` | Success states / match scores |
| `amber` | `#f59e0b` | Warning states / mid-range scores |

### Typography
- **Main Font:** `DM Sans` (Inter or Roboto as fallback)
- **Technical/Badge Font:** `Space Mono` (for scores, labels, and AI extraction results)

## Component Implementation Rules

### 1. Motion & Transitions
Use `framer-motion` for all state changes, slide-ins, and modals.
- **Entering:** `initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}`
- **Hover:** Subtle scaling or background color shifts.

### 2. Shadcn UI & Tailwind
- Use Shadcn UI for base components (Buttons, Cards, Inputs).
- Strictly avoid custom CSS; use Tailwind utility classes.
- Ensure all interactive elements have ARIA labels.

### 3. Feature-Specific Components
- **ScoreBadge:** Color-coded based on score (>90% Green, 80-90% Blue, <80% Amber).
- **ScanLine:** Use for any "Processing" or "Parsing" states to provide visual feedback.

## Implementation Procedure
1. Create/Update component in `/components/features` or `/components/ui`.
2. Apply Tailwind classes and Framer Motion animations.
3. Verify against `prototype_bestmatch.jsx` for visual parity.
4. Ensure accessibility (keyboard navigation, contrast > 4.5:1).

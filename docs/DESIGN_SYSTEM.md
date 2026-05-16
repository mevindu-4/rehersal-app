# Rehearsal — Design System

**Aesthetic:** "The dressing room before going on stage." Premium, serious, cinematic.

**Avoid:** Purple-blue gradients, glowing buttons, sparkle/AI icons, blob backgrounds, Inter font, default shadcn blue accent.

---

## Theme

- **Primary:** Dark mode  
- **Secondary:** Light mode toggle (optional, lower priority)  

---

## Colors (CSS variables — dark)

```css
--background: #0A0A0B;
--surface: #141416;
--surface-elevated: #1C1C1F;
--border-subtle: #26262A;
--border-default: #33333A;
--text-primary: #F5F4F1;
--text-secondary: #A8A6A0;
--text-tertiary: #6E6C66;
--accent: #E8A33D;        /* amber stage-light */
--success: #7B9B5E;        /* sage */
--critical: #C84F3D;      /* terracotta */
--highlight-glow: rgba(232, 163, 61, 0.08);
```

Configure in `app/globals.css` and `tailwind.config.ts`.

---

## Typography

Load in `app/layout.tsx` from Google Fonts:

| Font | Use |
|------|-----|
| **Fraunces** (400, 600) | Headlines, target names, scores, executive summary |
| **Geist Sans** (400, 500, 600) | UI body, buttons |
| **Geist Mono** (400) | Captions, timestamps, metadata |

| Scale | Size / Line / Tracking |
|-------|------------------------|
| Display 1 | 64px / 1.05 / -2% |
| Display 2 | 48px / 1.1 / -1.5% |
| H1 | 32px / 1.2 / -1% |
| H2 | 24px / 1.3 / -0.5% |
| H3 | 18px / 1.4 |
| Body Large | 17px / 1.6 |
| Body | 15px / 1.55 |
| Small | 13px / 1.5 |
| Caption | 11px / 1.4 / +5% uppercase (mono) |

---

## Layout & spacing

- Base unit: **8px** (multiples of 4px)  
- Max content width: **1280px** (app)  
- Sidebar: **240px** fixed  
- Card padding: 16px default, 24px elevated  
- Modal: 32px padding; max-width **560px** (720px for avatar brief)  

---

## Components (shadcn)

Initialize with **amber** accent (not default blue):

- Button, Input, Card, Dialog, Select, Tabs, Tooltip, Skeleton, Slider, Checkbox

**Icons:** Lucide only, stroke 1.5px, sizes 16 / 20 / 24px. No emoji in UI.

---

## Motion

| Use | Timing |
|-----|--------|
| Standard interactions | 180ms ease-out |
| Slow reveal | 320ms cubic-bezier(0.16, 1, 0.3, 1) |
| Score gauges | 0 → value over **800ms** |
| Page enter | fade + 4px translateY, stagger 40ms |

---

## Shadows

- **Dark mode:** Prefer borders; floating elements only: `0 12px 32px rgba(0,0,0,0.4)`  
- **Light mode:** `0 1px 2px rgba(20,20,15,0.04), 0 8px 24px rgba(20,20,15,0.06)`  

---

## Screen-specific tokens

| Screen | Notes |
|--------|-------|
| Live session iframe | max-width 960px, 16:9, `box-shadow` + amber glow (`--highlight-glow`) |
| Report hero | amber-tinted dark band, full width |
| Key moment — worked | sage left border 3px |
| Key moment — improve | terracotta left border 3px |
| Timer (last 60s) | pulse animation on accent color |
| Active sidebar item | 3px amber left border |

---

## Difficulty slider

Track gradient: **sage (1)** → **amber (3)** → **terracotta (5)**

Labels under thumb: Patient / Conversational / Standard / Demanding / Intense

---

## Score descriptors

| Range | Label |
|-------|-------|
| 80–100 | Strong |
| 60–79 | Mixed |
| 0–59 | Needs work |

---

## Implementation checklist

- [ ] `globals.css` variables match table above  
- [ ] `tailwind.config.ts` extends colors with semantic names  
- [ ] shadcn `components.json` uses amber primary  
- [ ] Fraunces on report scores and target names only (avoid overuse)  

Full screen layouts: [FRONTEND_SPEC.md](./FRONTEND_SPEC.md)

# Global Design for Prism

The following information applies to all designs done for PRISM. 

## Font
Nunito (Google Fonts), loaded weights: 400, 500, 600, 700, 800

Weight	Used for
400	Body copy — descriptions, source titles, summary text, counter-summary
600	Score number/denom, both button types, print button in report
700	Start title, section collapse headers (VERIFIED BY, COUNTERARGUMENT), source badge labels, loading title, article title in report, section labels in report
800	Score category label (Verified / Contested / Disputed), brand name in report header, score number in report


## Colors
### Score

| Hex |	Name | Used for |
|---|---|---|
| #3471CE	| Blue	| Verified score, primary CTA button, btn-outline border+text, source link hover, Supportive badge text |
| #7B6EF6	| Periwinkle	| Contested score color |
| #8B1A2F	| Red Wine	| Disputed score color, error icon, error text |

### Text

| Hex	| Used for |
|---|---|
| #0F0B3E	| Primary text — all headings, collapse titles, source titles, body copy |
| #555570 | Secondary — loading subtitle, descriptions, score desc in report, Neutral badge text |
| #9090A8 | Muted — domain links, share icon, read more link, report meta, section labels in report | 

### Surfaces

| Value	| Used for |
|---|---|
| #F8F8FC | Hover state on collapsible rows, report footer background |
| rgba(200, 200, 230, 0.35) | Scrollbar thumb |
| rgba(200, 200, 230, 0.45)	| Section divider borders in report | 

### Badges

| Stance	| Background |	Text |
|---|---|---|
| Supportive |	rgba(52, 113, 206, 0.12) | #3471CE |
| Opposing |	rgba(139, 26, 47, 0.10) | #8B1A2F |
| Neutral |	rgba(100, 100, 130, 0.10) | #555570 |
| Reasoning | rgba(51, 89, 129, 0.20) | #335981 |

### Gradients

Report header + start-brand-footer: 135deg, #BDB4FF → #8B82F0 → #6156D4
Logo drop shadow: rgba(88, 153, 244, 0.45)

### Misc

Button hover (primary): #6C63FF (purple shift from the blue)
Score bar track: rgba(200, 200, 220, 0.3)
Icon button hover: rgba(200, 200, 220, 0.2)

### Button Design
#### Primary (.btn-primary)

Background: #3471CE, hover #6C63FF
Text: white, 15px, weight 600
Shape: fully pill — border-radius: 999px
Padding: 14px 20px
No border
Active: scale(0.98)
Layout: flex row with icon + label, gap: 10px

#### Outline (.btn-outline)

Background: transparent, hover rgba(88, 153, 244, 0.06)
Text: #3471CE, 15px, weight 600
Border: 1.5px solid #3471CE
Shape: fully pill — border-radius: 999px
Padding: 13px 20px
Disabled: opacity: 0.4
Active: scale(0.98)

#### Icon button (.icon-btn) 

Background: none, hover rgba(200, 200, 220, 0.2)
No border
Border-radius: 8px (subtle, not pill)
Padding: 6px
Color: --ink-mid by default; cancel X overrides to --ink (darker)
Print button (inline in report.html) — matches primary style: #3471CE, pill, white text 14px/600, hover opacity: 0.88

## Icon Library
Feather Icons — used inline as hand-coded SVGs (no CDN, no library import). 

## Illustrations 
Using undraw.co illustrations in the brand colors available as SVGs on https://undraw.co/illustrations
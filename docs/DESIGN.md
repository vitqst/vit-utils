# Design

## Direction

The shell follows the supplied `vit tools.dc.html` reference: a dense dark workspace, a narrow catalog rail, warm amber accents, compact monospace metadata, and restrained motion. A light theme uses the same hierarchy and interaction colors.

## Tokens

- Dark canvas: `#0b0e14`
- Dark surfaces: `#11151d`, `#171c26`, `#1e2531`
- Dark primary text: `#d7dce4`
- Accent: `#ffb454` (dark), `#c96a00` (light)
- Privacy/success: `#7fd962` (dark), `#1a7f37` (light)
- Radius: 8px controls, 12–16px surfaces
- Typography: locally bundled Be Vietnam Pro for reading and JetBrains Mono for ids, shortcuts, and counts

## Rules

- The first viewport communicates purpose, privacy, and the primary tool action.
- Avoid nested card stacks and decorative dashboards.
- Tool workspaces may own a specialized visual system, but the platform header and privacy badge stay consistent.
- Use color plus text/icon; never encode keep/reject or status by color alone.
- Mobile removes the persistent sidebar and keeps primary actions reachable.
- Animation is short and functional. Respect the operating system’s reduced-motion preference.

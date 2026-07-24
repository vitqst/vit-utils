# Technical Debt Tracker

| ID | Item | Impact | Trigger | Status |
| --- | --- | --- | --- | --- |
| TD-002 | Replace the legacy Photo Cure JSX implementation with strict TypeScript in slices | Tool internals do not yet receive TypeScript diagnostics | When changing each Photo Cure subsystem | Open |
| TD-003 | Add install icons and screenshots to the web manifest | PWA install presentation is minimal | Before public launch | Open |
| TD-004 | Add automated offline browser coverage | Unit tests do not prove service-worker behavior | Before public launch | Open |
| TD-005 | Decide the canonical production domain | Canonical and sitemap default to `https://vit.tools` | Before Firebase production deploy | Open |

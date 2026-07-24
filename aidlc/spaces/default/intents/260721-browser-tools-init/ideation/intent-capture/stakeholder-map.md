# Stakeholder Map

## Stakeholders and Interests

| Stakeholder | Role | Primary interests | Influence | Decision rights |
|---|---|---|---|---|
| Repository owner | Product and release owner | Scope, product promise, visual direction, maintainability, release readiness | High | Final approval for product, scope, and release decisions |
| Privacy-conscious vi/en users | Primary customer | Immediate utility, understandable language, no data leakage, offline reliability | High | Validate usefulness and trust through feedback |
| Existing Photo Cure users | Migration stakeholder | Workflow continuity, responsive handling of local photos, no regressions | High | Validate parity; owner resolves tradeoffs |
| Search visitors | Discovery stakeholder | Direct page relevance, clear descriptions, fast first use | Medium | Influence content and discoverability priorities |
| Open-source contributors | Extension stakeholder | Clear boundaries, predictable tool addition, local setup, testable changes | Medium | Propose improvements and future tools |
| Future maintainers | Sustainability stakeholder | Coherent product structure, documented decisions, reliable checks | Medium | Maintain within owner-approved direction |
| Hosting operator | Delivery stakeholder | Repeatable static build, safe configuration, explicit production approval | Medium | Controls credentials and live release execution |

## Decision Model

- The repository owner is accountable and gives final approval at product and
  release gates.
- Primary users and existing Photo Cure users are consulted on usability,
  privacy clarity, and workflow continuity.
- Contributors and future maintainers are consulted on the ease and safety of
  extending the catalog.
- The hosting operator is responsible for any credentialed deployment action.
  This initiative produces deployment-ready configuration but does not assume
  authority to release.

## Communication Requirements

| Audience | Information required | Checkpoint |
|---|---|---|
| Repository owner | Scope boundaries, material tradeoffs, verification evidence, unresolved risks | AI-DLC approval gates |
| Primary users | Plain-language privacy promise, language choice, offline status, tool purpose | Product interface and documentation |
| Photo Cure users | Migration parity, supported local-file workflows, known behavioral changes | Acceptance and regression review |
| Contributors | How a tool is described and added, local development steps, validation expectations | Contributor documentation and CI feedback |
| Hosting operator | Build output, hosting configuration, release command, rollback considerations | Deployment-pipeline handoff |

## Alignment Risks

- The draft contains several working demonstration tools, while the approved
  initial release includes only the shared catalog experience and Photo Cure.
  Demonstrations must not silently become release scope.
- CDN assets are permitted away from tool pages, but the stronger zero
  third-party-request promise applies to every static tool page. Copy and
  verification must preserve that distinction.
- The first-structure draft is an approved baseline, not a pixel-lock.
  Accessibility and responsive corrections may adapt details without replacing
  its navigation and interaction direction.
- A Firebase-ready build does not authorize a live production deployment.

## Source Traceability

- Stakeholder and authority decisions: `intent-capture-questions.md`
- Product direction: `docs/requirements/20260721-init-app.md`
- Structural baseline: `docs/requirements/vit tools.dc.html`
- Existing-user workflow: current Photo Cure application

---
name: browser-tools-init
depth: Standard
keywords: []
description: Initialize the browser-tools platform from the existing photo app
skeleton: on
runner: true
---

# browser-tools-init scope

Standard-depth workflow for turning the existing single-purpose React photo
application into the initial browser-tools platform described in
`docs/requirements/20260721-init-app.md`.

The scope keeps the load-bearing brownfield discovery, requirements,
application and functional design, explicit privacy/offline/performance NFRs,
implementation, verification, CI, and Firebase deployment-pipeline work. It
folds duplicate product discovery and mockup stages into the supplied product
brief and detailed sample design, and does not authorize Firebase project
provisioning or a production deployment.

## Membership

This composed scope has no inference keywords and is selected explicitly with
`--scope browser-tools-init`. It executes 20 of the 32 compiled stages at
Standard depth. The walking skeleton is enabled so the registry-driven shell,
one migrated photo tool, and production build can establish an end-to-end
platform path before the remaining units are expanded.

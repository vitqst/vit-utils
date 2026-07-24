# Database Schema

Generated status: no database.

`vit.tools` is a static, local-first application. The current architecture stores only non-sensitive preferences (`locale`, favorites, and recent tool ids) in `localStorage`. Photo files and Photo Cure decisions remain in memory for the active session.

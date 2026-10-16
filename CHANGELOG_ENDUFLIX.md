# ENDUFLIX — dashboard patch (2026-10-17)

Base: ENDUFLIX_PRESENTATION_GITHUB_PAGES_20261017.zip, static adaptation of enduflix(1).zip.
PLAYY reference: Playy_Enduflix_UI_v5_LearningPlus_fix2(1).zip (layout inspiration only).

Changes:
- `assets/js/app.js`: admin-only dashboard route `?page=dashboard`, add dashboard link in existing admin dropdown, preserve previous routes.
- `assets/css/dashboard.css`: scoped responsive dashboard styles.
- `AGENTS.md`: project constraints.

Dashboard reads counts through existing authenticated ENDUFLIX Supabase client. Failed counts show `—` rather than fabricated zero.
No existing files removed. No database writes or migrations. No PLAYY data copied.

Testing: static assertions and JS syntax checked; browser login, RLS result counts, and GitHub deployment NOT tested.
Deploy: unzip and upload contents to GitHub repository root, replacing matching files; keep a backup of existing repository.

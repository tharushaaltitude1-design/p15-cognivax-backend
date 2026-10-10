<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Cognivax architecture
- Keep TanStack Start file-based routing; parent routes render Outlet and list/detail bodies live in index leaves so edit routes remain reachable.
- All five intelligence modules share ModuleList, ModuleForm and ModuleDetail configured by modules.ts to preserve behavioral parity.
- Components read domain data through TanStack Query and repository hooks; LocalRepository is the replaceable Phase 1 storage boundary for a future Firestore adapter.
- Keep seed construction lazy and browser storage access inside service calls triggered after hydration; never initialize browser-dependent data at module scope.
- Define all visual colors in src/styles.css and consume semantic tokens; reuse shadcn controls and common primitives.

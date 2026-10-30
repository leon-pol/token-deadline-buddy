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

- Workspace data flows through src/services/* adapters (catalog, requirements parsing, matching, in-memory store); UI never fetches directly — so the backend team can swap adapters.
- No buyer requirement data is ever seeded; only the sample supplier CSV in src/data is bundled.

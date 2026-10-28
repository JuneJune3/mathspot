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

- Web browsing routes through the multi-provider router in src/lib/hyperbrowser.functions.ts (Hyperbrowser, Steel, Kernel); openSite requires sign-in, prefers the user's saved key (user_api_keys) over project secrets, and falls back to the next configured provider on failure. Keys stay server-side; only the live view URL reaches the client.
- Personal game ratings are stored on the current device, not represented as community vote counts.
- Cross-origin iframe focus is treated as activity while this tab is visible; parent pages cannot inspect in-game keyboard and mouse events.

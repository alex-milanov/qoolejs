# QooleJS

Quake2-style level editor (work in progress).

**Live demo:** [alex-milanov.github.io/qoolejs](https://alex-milanov.github.io/qoolejs/) (deploys from `master` / `main` via GitHub Actions)

## Setup

```sh
pnpm install
```

## Develop / build

```sh
pnpm start    # Parcel dev server
pnpm build    # production build → dist/ (public URL /qoolejs/)
pnpm lint     # Biome + eslint-plugin-iblokz-style
```

## Upgrade roadmap

1. **Phase 1 (current):** Parcel build tools  
2. **Phase 2:** Shell stack — iblokz-state, RxJS 7, Snabbdom helpers v2 (no `ql` / Three logic changes)  
3. **Phase 3:** Single dark/light theme + ide-style resizable panels  
4. **Phase 4:** Three.js / `ql` structure (brainstorm when ready)

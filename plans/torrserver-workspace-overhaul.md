# TorrServer Workspace Overhaul

## Context

- Repo page to improve: `src/routes/(auth-guard)/torrserver/index.tsx`
- Existing service boundary: `src/services/torrserver.ts`
- Live TorrServer validated against: `http://192.168.0.109:8090`
- Live version detected: `MatriX.141`
- Upstream docs:
  - README API entry point: `https://github.com/YouROK/TorrServer#api`
  - Swagger on live instance: `http://192.168.0.109:8090/swagger/doc.json`

## Current Gaps

1. The page only supports:
   - saved server URLs
   - `/echo` connectivity
   - `/torrents { action: list }`
   - `/torrents { action: rem }`
2. File-level playback is not exposed even though TorrServer returns `file_stats`.
3. The UI is a flat library list with no filtering, no diagnostics, and no file inspector.
4. The service layer lacks typed helpers for:
   - torrent details
   - playlist URLs
   - direct stream/play URLs
   - settings snapshot
   - storage settings
5. Adding a torrent from the movie/TV flow does not use API metadata fields like `category`.

## Confirmed Useful API Surface

Safe or low-risk endpoints we can use:

- `GET /echo`
- `POST /torrents` with `list`, `get`, `add`, `rem`
- `GET /playlist?hash=...`
- `GET /play/{hash}/{id}`
- `GET /stream?...`
- `POST /settings` with `action: "get"`
- `GET /storage/settings`
- `GET /tmdb/settings`

Observed live behavior:

- `GET /playlist?hash=...` returns an M3U with a direct `/stream/...?...&index=...&play` URL.
- `POST /torrents { action: "get", hash }` returns richer status than list output and includes `file_stats`.
- `POST /settings { action: "get" }` returns PascalCase keys on the live server, even though Swagger shows camelCase.

Endpoints intentionally not exposed in normal UI flow:

- `GET /shutdown`
- `POST /settings` with `set` or `def`
- `POST /storage/settings`
- destructive bulk operations like `wipe`

## UX Direction

Tone:

- Operational media-control workspace
- Not an admin form and not a generic grid page

Primary structure:

1. Connection + server health header
2. Workspace split
   - main: library controls + torrent cards
   - side rail: server settings snapshot + storage/tmdb summary + playback panel
3. File and playback interactions
   - file picker modal or expandable inspector
   - browser player modal
   - playlist / direct stream actions

## Planned Features

### Phase 1: Service and state foundations

1. Expand `src/services/torrserver.ts` with typed helpers for:
   - normalize base URL
   - build magnet URL from hash
   - list torrent library
   - get single torrent details
   - get settings snapshot
   - get storage settings
   - get TMDB settings
   - build playlist URL
   - build direct stream/play URL
2. Normalize inconsistent API response shapes where needed.
3. Improve `addTorrent()` to pass `category` (`movie` or `tv`) when possible.
4. Add focused Bun tests for pure helpers and URL builders.

### Phase 2: Page architecture

1. Refactor `/torrserver` route to separate:
   - server persistence and selection state
   - data loading / refresh logic
   - UI-level derived state (filters, selection, player state)
2. Remove avoidable legacy logic duplication with `torrserver-state.ts`.
3. Add refresh behavior without requiring server re-selection.

### Phase 3: Library workspace UI

1. Upgrade the library from a flat grid to a workspace with:
   - filter/search input
   - quick chips for status/category/media type
   - sort options (recent, peers, speed, title)
2. Enrich cards with:
   - current status
   - peers / seeders
   - download/upload/preload metrics when available
   - file count
   - primary actions

Primary per-item actions:

- open media details in app
- copy/open magnet
- open file list
- play selected file
- download/open playlist
- remove torrent

### Phase 4: File inspector and player

1. Add file list UI sourced from `file_stats`.
2. For each file expose:
   - filename
   - size
   - direct stream/play link
   - browser player launch
3. Add a player modal using HTML `<video>` with the TorrServer HTTP stream URL.
4. Handle browser playback limitations gracefully:
   - show an “experimental browser playback” hint
   - keep direct stream and playlist links available as fallback

### Phase 5: Diagnostics rail

1. Show a read-only server settings summary:
   - cache size
   - preload percentage
   - read-ahead
   - rate limits
   - connections limit
   - disk mode / proxy / DLNA flags
2. Show storage settings summary:
   - settings backend
   - viewed backend
   - viewed count
3. Show TMDB config summary from TorrServer if available.

## Implementation Ownership Split

### Main agent

- service refactor in `src/services/torrserver.ts`
- route data flow and page integration in `src/routes/(auth-guard)/torrserver/index.tsx`
- test additions

### Frontend worker

- presentational workspace sections and player/file inspector components

## Verification

Required:

1. `bun run build.types`
2. `bun run lint`
3. `bun run test`
4. `bun run build`

Manual validation against live TorrServer:

1. Connect to `http://192.168.0.109:8090`
2. Confirm version and settings load
3. Confirm torrent list loads
4. Open a torrent file list
5. Launch browser player for a file
6. Confirm playlist link resolves
7. Confirm remove action still works

## Risks

1. Browser playback depends on codec/container support; many `.mkv` files may not play natively.
2. Some endpoints are inconsistent in response shape or may return empty bodies.
3. Live TorrServer data can be large because `data` embeds rich media metadata.

## Mitigations

1. Keep direct stream and playlist actions alongside the embedded player.
2. Treat diagnostics endpoints as best-effort and render gracefully when empty.
3. Parse and normalize `data` defensively.

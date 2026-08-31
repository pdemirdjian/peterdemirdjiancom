# Issue tracker: Linear

Issues and specs for this repo live in Linear — workspace `pdemirdjian`
(https://linear.app/pdemirdjian), team `pdemirdjian`. Use the Linear MCP tools
(`mcp__plugin_linear_linear__*`) for all operations. If they aren't loaded,
load them via ToolSearch first.

## Conventions

- **Create an issue**: `save_issue` with the team `pdemirdjian`, a title, and a
  markdown description. Apply labels at creation when known.
- **Read an issue**: `get_issue` by identifier; `list_comments` for its thread.
- **List issues**: `list_issues` filtered by team, state, and label.
- **Comment on an issue**: `save_comment`.
- **Apply / remove labels**: `save_issue` updating the `labels` field. Create
  missing labels with `create_issue_label` (team-scoped) before applying.
- **Close**: `save_issue` setting the state to Done (or Canceled for wontfix),
  with a closing comment via `save_comment`.

Refer to issues by their Linear identifier (team key + number). Existing
non-triage labels: `Bug`, `Feature`, `Improvement` — keep using them for
categorization alongside the triage labels.

## When a skill says "publish to the issue tracker"

Create a Linear issue in the `pdemirdjian` team.

## When a skill says "fetch the relevant ticket"

`get_issue` + `list_comments` for the named identifier.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: an issue labelled `wayfinder:map`, holding the Notes /
  Decisions-so-far / Fog body.
- **Child ticket**: a sub-issue of the map (`save_issue` with `parent` set to
  the map). Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`).
  Once claimed, assign the ticket to the driving dev.
- **Blocking**: a `Blocked by: <identifier>, <identifier>` line at the top of
  the child description (the MCP tools don't expose Linear's native relations).
  A ticket is unblocked when every blocker is Done.
- **Frontier query**: `list_issues` for the map's open children; drop any with
  an open blocker or an assignee; first in map order wins.
- **Claim**: assign the issue to yourself (`save_issue` with `assignee`), the
  session's first write.
- **Resolve**: post the answer as a comment, move the issue to Done, then
  append a context pointer to the map's Decisions-so-far.

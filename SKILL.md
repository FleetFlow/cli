# FleetFlow CLI Agent Guide

Use this CLI when an agent needs to operate FleetFlow from a shell. Run commands with `ff` or `fleetflow`; in this repository use Bun (`bun run ./bin/run.js ...`) when invoking the local checkout.

## Authentication And Context

- `ff login [--host fleetflow.io|localhost] [--port 17891] [--no-open]` starts a localhost OAuth callback server, opens FleetFlow Auth, exchanges the PKCE code, calls `/api/oauth/userinfo`, stores tokens/profile, and selects an organization.
- `ff logout` clears the local session file from oclif's config directory.
- `ff whoami [--json]` shows the logged-in platform user profile.
- `ff orgs [--json]` lists organizations available to the profile.
- `ff org select <uuid-or-name>` stores the default organization. UUID, API key, name, and slug selectors are accepted.
- `ff org current [--json]` prints the stored organization.

Organization choice precedence is `--org`, then `FLEETFLOW_ORG`, then the stored selected organization. Organization API requests send `Authorization: Bearer <access_token>` and `X-Api-Key: <organization api_key>`. Expiring access tokens are refreshed automatically with the stored refresh token before requests.

## Generated CRUD Commands

CRUD command files are generated from `platform/services/organization-api/src/v1` by `bun run generate`. Every route directory with the standard FleetFlow files (`get.js`, `get-uuid.js`, `post.js`, `patch-uuid.js`, `delete-uuid.js`) gets:

- `ff <resource> list [--page n] [--query text] [--match key=value] [--no-limit] [--json] [--org selector]`
- `ff <resource> get <uuid> [--json] [--org selector]`
- `ff <resource> create (--data json | --file path | --field key=value...) [--image path] [--json] [--org selector]`
- `ff <resource> update <uuid> (--data json | --file path | --field key=value...) [--image path] [--json] [--org selector]`
- `ff <resource> delete <uuid> [--force] [--json] [--org selector]`

Generated resources include vehicles, vehicle components, vehicle customers, customers, customer vehicles, models, components, products, orders, service tickets, users, roles, locations, warranty profiles, maintenance profiles, diagnostic profiles, translations, mobile applications, OAuth applications, and the nested CRUD resources discovered in the route tree.

Nested resources place parent UUIDs before the final resource UUID. Examples:

- `ff vehicles components list <vehicle_uuid>`
- `ff vehicles components get <vehicle_uuid> <uuid>`
- `ff customers vehicles list <customer_uuid>`
- `ff orders components create <order_uuid> --field component_uuid=... --field quantity=1`

Input for create/update accepts JSON from `--data`, JSON file content from `--file`, piped stdin, or repeated `--field key=value`. Dotted field keys create nested objects. Values like `true`, `false`, `null`, numbers, arrays, and objects are parsed as JSON when possible. `--image path` sends multipart form data with an `image` file.

Default output is a compact readable table/list. Use `--json` for scripting and to preserve raw API response shape.

## Raw API Escape Hatch

Use `ff api <get|post|patch|delete> <path> [--data json] [--file path] [--json] [--org selector]` for non-CRUD endpoints, special workflows, statistics, exports, rollout endpoints, integration starts, and new routes before aliases are generated. The path can be below `/v1` or include `/v1/...`.

## Safety Rules

Destructive generated commands require confirmation in an interactive terminal. In scripts or CI, pass `--force`; without it, deletes fail rather than prompting invisibly. Prefer `--json` and explicit `--org` or `FLEETFLOW_ORG` for automation.

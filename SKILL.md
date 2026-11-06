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
- `ff <resource> create (--data json | --file path | --field key=value...) [--upload [field=]path] [--image path] [--json] [--org selector]`
- `ff <resource> update <uuid> (--data json | --file path | --field key=value...) [--upload [field=]path] [--image path] [--json] [--org selector]`
- `ff <resource> delete <uuid> [--force] [--json] [--org selector]`

Use `--schema` on any generated command to ask the organization API which request parameters are accepted for that action. It calls the resource endpoint with `OPTIONS` and prints path/query/body/file schemas extracted from the API validators.

- `ff articles list --schema`
- `ff articles create --schema --json`
- `ff articles update --schema`

Generated resources include vehicles, vehicle products, vehicle customers, customers, customer vehicles, models, components, products, orders, service tickets, users, roles, locations, warranty profiles, maintenance profiles, diagnostic profiles, translations, mobile applications, OAuth applications, and the nested CRUD resources discovered in the route tree.

Nested resources place parent UUIDs before the final resource UUID. Examples:

- `ff vehicles products list <vehicle_uuid>`
- `ff vehicles products get <vehicle_uuid> <uuid>`
- `ff customers vehicles list <customer_uuid>`
- `ff products firmwares list <product_uuid>`

Input for create/update accepts JSON from `--data`, JSON file content from `--file`, piped stdin, or repeated `--field key=value`. Dotted field keys create nested objects. Values like `true`, `false`, `null`, numbers, arrays, and objects are parsed as JSON when possible. `--upload [field=]path` (repeatable) sends multipart form data instead of JSON: every body field becomes a form field and each file is attached under its field name. A bare path is sent as `file`, which upload routes such as firmwares read; `--image path` is shorthand for `--upload image=path`. Run `--schema` to see which file field a route expects.

Uploading a firmware build to a product:

- `ff products firmwares create <product_uuid> --upload ./firmware.bin --field version=1.3.1 --field status=active --field kind=release`

FleetFlow computes the SHA-256 from the uploaded file.

Default output is a compact readable table/list. Use `--json` for scripting and to preserve raw API response shape.

## Raw API Escape Hatch

Use `ff api <get|post|patch|delete|options> <path> [--data json] [--file path] [--field key=value] [--upload [field=]path] [--json] [--org selector]` for non-CRUD endpoints, special workflows, statistics, exports, rollout endpoints, integration starts, schema inspection, and new routes before aliases are generated. The path can be below `/v1` or include `/v1/...`.

For raw schema inspection, include the action method as a query parameter:

- `ff api options /v1/articles/{uuid1}?method=PATCH --json`

## Safety Rules

Destructive generated commands require confirmation in an interactive terminal. In scripts or CI, pass `--force`; without it, deletes fail rather than prompting invisibly. Prefer `--json` and explicit `--org` or `FLEETFLOW_ORG` for automation.

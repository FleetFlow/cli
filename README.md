# FleetFlow CLI

FleetFlow CLI is an oclif-based command line tool for authenticating with FleetFlow, selecting an organization, and calling FleetFlow organization API resources from a terminal or automation.

The CLI exposes both `fleetflow` and `ff` binaries.

## Install

The package is not published to npm yet. Install it globally from the public GitHub repo:

```bash
npm install -g github:FleetFlow/cli
```

Or with Bun:

```bash
bun install -g github:FleetFlow/cli
```

Then sign in:

```bash
ff login
ff whoami
ff orgs
ff org select <uuid-or-name>
```

For local development from this repository, use Bun:

```bash
bun install
bun run ./bin/run.js whoami
```

## Common Commands

```bash
ff login
ff logout
ff whoami
ff orgs
ff org current
ff org select <uuid-or-name>
```

Generated CRUD commands follow this shape:

```bash
ff <resource> list [--json] [--org selector]
ff <resource> get <uuid> [--json] [--org selector]
ff <resource> create --field key=value [--json] [--org selector]
ff <resource> update <uuid> --field key=value [--json] [--org selector]
ff <resource> delete <uuid> --force [--json] [--org selector]
```

For endpoints that do not have a generated command yet, use the raw API command:

```bash
ff api get /v1/vehicles --json
ff api post /v1/vehicles --data '{"name":"Demo"}' --json
```

## Authentication And Organization Context

`ff login` opens FleetFlow Auth, completes the OAuth flow locally, stores the session in oclif's config directory, and lets you select an organization.

Organization selection is resolved in this order:

1. `--org`
2. `FLEETFLOW_ORG`
3. the organization stored by `ff org select`

Organization API requests send the logged-in user's bearer token and the selected organization's API key. Expiring access tokens are refreshed automatically when possible.

## Agent Skill

This repository includes [SKILL.md](./SKILL.md), an agent-facing guide for using the CLI safely from Codex or another compatible coding agent.

To install the skill locally, copy or symlink this package directory into your Codex skills folder, or install it through the FleetFlow CLI plugin if that plugin is available in your Codex environment. After installation, agents can use the `fleetflow` skill to authenticate, select organizations, run generated CRUD commands, and call raw FleetFlow API endpoints.

## Development

Use Bun for local package work:

```bash
bun install
bun run generate
bun test
```

Generated resource commands are built from the FleetFlow organization API route tree in the monorepo. Run `bun run generate` after API route changes.

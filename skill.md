# Google Ads CLI Skill (`google-ads-cli`)

This skill trains an agent to operate `google-ads-cli` reliably in automation and agentic pipelines.

## 1) Tool identity

- Package: `google-ads-cli`
- Binary: `google-ads-cli`
- Local dev entry: `npm run dev -- <command>`

## 2) Capabilities

The CLI supports:

- Setup and credential/profile management
- OAuth authentication
- Account listing
- Campaign and ad group inspection
- Keyword Planner idea generation
- Geo target location lookup
- GAQL query execution

## 3) Prerequisites and readiness checks

Preflight checks:

1. Node >= 18
2. Setup completed (`setup`)
3. Authenticated profile (`auth`)
4. Required account context exists (customer ID/login customer ID)

Readiness commands:

```bash
google-ads-cli --version
google-ads-cli --help
google-ads-cli config
google-ads-cli profiles --list
```

## 4) First-time workflow

### 4.1 Setup

```bash
google-ads-cli setup
```

Provide:

- OAuth client ID
- OAuth client secret
- Developer token
- Customer ID (no dashes)
- Optional login customer ID for MCC use

### 4.2 Authenticate

```bash
google-ads-cli auth
```

Use profile-specific auth if needed:

```bash
google-ads-cli auth --profile my-profile
```

### 4.3 Verify access

```bash
google-ads-cli accounts
google-ads-cli campaigns --limit 5
```

## 5) Command reference for agents

Auth/config:

- `setup`
- `auth`
- `logout`
- `profiles --list`
- `profiles --switch`
- `config`

Accounts:

- `accounts [--json]`

Campaigns/ad groups:

- `campaigns [-l <limit>] [--json]`
- `campaign <id> [--json]`
- `ad-groups -c <campaign-id> [-l <limit>] [--json]`

Keyword planning:

- `keyword-ideas [keywords...] [--url <url>] [--language <code>] [--location <codes...>] [--limit <n>] [--json]`
- `locations <search> [-l <limit>] [--json]`

Reporting:

- `query <gaql> [-f <file>] [--json]`

Profile scoping is available via `-p, --profile` on most commands.

## 6) High-confidence automation runbooks

### 6.1 Campaign snapshot

```bash
google-ads-cli campaigns --limit 25 --json
```

### 6.2 Drill into a campaign then ad groups

```bash
google-ads-cli campaign 1234567890 --json
google-ads-cli ad-groups --campaign-id 1234567890 --limit 50 --json
```

### 6.3 Keyword ideation pipeline

```bash
google-ads-cli keyword-ideas "seo tools" "content marketing" --location 2840 --limit 100 --json
```

### 6.4 GAQL reporting

```bash
google-ads-cli query "SELECT campaign.id, campaign.name, metrics.clicks FROM campaign WHERE segments.date DURING LAST_30_DAYS LIMIT 50" --json
```

or from file:

```bash
google-ads-cli query "" --file ./report.gaql --json
```

## 7) Agent operating standards

1. Prefer `--json` for machine parsing and deterministic outputs.
2. Validate authentication before expensive queries.
3. Keep profile/account context explicit for multi-account environments.
4. Validate required options (`--campaign-id`, GAQL string/file).
5. Avoid mutative assumptions: this CLI is mostly read/reporting oriented.

## 8) Structured output guidance

For agent pipelines, capture:

- command
- profile used
- customer context
- result count
- key IDs returned
- errors with remediation

When parsing tables, prefer re-running with `--json` rather than scraping table output.

## 9) Failure handling patterns

### Not authenticated

```bash
google-ads-cli auth
```

### Missing credentials/profile

```bash
google-ads-cli setup
google-ads-cli profiles --list
```

### Developer token limitations

If token in test mode, restrict operations to owned/managed accounts and report limitation.

### Customer/account mismatch

Re-run setup or use the intended profile:

```bash
google-ads-cli config --profile my-profile
```

### OAuth callback issues (port conflict)

Check local process conflicts and retry auth flow.

## 10) Multi-profile best practices

- One profile per client/account boundary.
- Use explicit `--profile` in automation jobs.
- Validate active profile before execution (`config`, `profiles --list`).

## 11) Minimal agent command packs

Read-only health check:

```bash
google-ads-cli config
google-ads-cli accounts --json
google-ads-cli campaigns --limit 5 --json
```

Keyword research pack:

```bash
google-ads-cli locations "United States" --json
google-ads-cli keyword-ideas "b2b saas crm" --location 2840 --limit 75 --json
```

GAQL reporting pack:

```bash
google-ads-cli query "SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks FROM campaign WHERE segments.date DURING LAST_7_DAYS LIMIT 25" --json
```

## 12) Security basics

- Never print client secret, refresh tokens, or raw credential files.
- Never commit local config/secrets.
- Keep OAuth data local to operator machine.
- Use least-privilege access and intended customer IDs only.


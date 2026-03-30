# Compliance Skill: Google Ads CLI

This document defines compliance guardrails for agent use of `google-ads-cli`.

## Scope

Applies to all invocations of:

- `google-ads-cli`
- `npm run dev -- <google-ads command>`

## 1) Sensitive data handling

Treat as secrets:

- OAuth client secret
- Refresh/access tokens
- Developer token
- Local credential/config files

Requirements:

- Redact secrets in logs and summaries.
- Never commit credential-bearing files.
- Avoid sharing raw token/error payloads that include secrets.

## 2) Account boundary compliance

Google Ads data is tenant-sensitive.

Agent must:

1. Confirm target profile/customer before query execution.
2. Keep workloads scoped to intended account boundary.
3. Avoid cross-client data mixing in outputs.

## 3) Authentication policy

- Use only user-provided, authorized OAuth credentials.
- Authenticate through official OAuth flow (`auth`).
- Do not bypass auth mechanisms or store credentials in ad hoc paths.
- Re-authenticate on invalid/expired sessions.

## 4) Command risk classification

Low risk (read/reporting):

- `accounts`, `campaigns`, `campaign`, `ad-groups`, `keyword-ideas`, `locations`, `query`, `config`, `profiles --list`

Medium risk:

- `profiles --switch` (context change risk)

Operationally sensitive:

- `setup`, `logout` (credential/state changes)

No destructive ad-edit operations are exposed in this CLI surface; maintain read-first posture.

## 5) Pre-execution controls

Before running account queries:

1. Verify profile (`config` or explicit `--profile`)
2. Verify authentication state
3. Validate required flags and query syntax
4. Ensure result format expectations (`--json` for automation)

## 6) Logging/audit requirements

Log:

- command (sanitized)
- profile used
- query type (campaigns/keywords/gaql)
- success/failure
- result counts

Do not log:

- tokens/secrets
- full credential file contents

## 7) Error handling compliance

- Surface failures transparently.
- Do not claim successful execution when command fails.
- On permission/developer-token errors, stop and explain compliance-safe remediation.
- Avoid uncontrolled retry loops on API failures.

## 8) Rate limit and usage governance

- Respect Google Ads API quota/operation limits.
- Minimize redundant high-volume queries.
- Prefer bounded queries (`LIMIT`, `--limit`) in automation.

## 9) Query safety for GAQL

For `query`:

- Restrict to expected fields/resources for task.
- Prefer read-only reporting semantics.
- Validate source when using `--file` to avoid accidental wrong queries.

## 10) Compliance-safe examples

```bash
google-ads-cli config --profile client-a
google-ads-cli campaigns --profile client-a --limit 20 --json
google-ads-cli keyword-ideas "crm software" --profile client-a --location 2840 --limit 50 --json
google-ads-cli query "SELECT campaign.id, campaign.name FROM campaign LIMIT 10" --profile client-a --json
```

## 11) Prohibited behaviors

- Printing or storing secrets in task logs
- Querying unintended client accounts
- Running ambiguous commands without explicit profile in multi-client context
- Returning fabricated or unverified metrics


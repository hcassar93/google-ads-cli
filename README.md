# Google Ads CLI

A command-line interface for the Google Ads API, enabling programmatic access to campaigns, ad groups, keywords, and the Keyword Planner tool. Built with Node.js and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 **OAuth 2.0 Authentication** - Secure authentication with automatic token refresh
- 📊 **Campaign Management** - List and view campaigns, ad groups, and performance metrics
- 🔍 **Keyword Planner** - Generate keyword ideas with search volume and competition data
- 📈 **Custom Reports** - Execute GAQL (Google Ads Query Language) queries
- 👥 **Multi-Profile Support** - Manage multiple Google Ads accounts
- 🎨 **Rich Output** - Table formatting and JSON export options
- 💾 **Secure Storage** - Encrypted credential storage with 0600 file permissions

## Prerequisites

Before using this CLI, you need:

1. **Google Cloud Project** with Google Ads API enabled
2. **OAuth 2.0 Credentials** (Desktop application type)
3. **Developer Token** from Google Ads API Center
4. **Google Ads Customer ID** (10-digit account ID)

### Setup Guide

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Ads API**:
   - Navigate to **APIs & Services > Library**
   - Search for "Google Ads API"
   - Click **Enable**

#### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in the required fields:
   - App name: `Google Ads CLI`
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. Add scopes: `https://www.googleapis.com/auth/adwords`
6. **Add Test Users**: Add your Google account email
7. Complete the setup

#### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Desktop app** as application type
4. Name it (e.g., "Google Ads CLI Desktop")
5. Click **Create**
6. Download or copy the **Client ID** and **Client Secret**

#### 4. Get Developer Token

1. Sign in to your [Google Ads account](https://ads.google.com/)
2. Click **Tools & Settings** (wrench icon)
3. Under **Setup**, click **API Center**
4. Copy your **Developer Token**

> **Note**: New developer tokens start in "Test" mode, which limits API access to accounts you own or manage. To access other accounts, you'll need to apply for Standard Access (requires a review process).

#### 5. Find Your Customer ID

1. In Google Ads, look at the top right corner
2. Your Customer ID is the 10-digit number (format: XXX-XXX-XXXX)
3. Remove dashes when entering it (e.g., `1234567890`)

## Installation

### Option 1: Install from npm (Recommended)

Install globally from npm:

```bash
npm install -g google-ads-cli
```

### Option 2: Install from Source

Clone the repository and build locally:

```bash
git clone https://github.com/hcassar93/google-ads-cli.git
cd google-ads-cli
npm install
npm run build
npm link  # Install globally
```

### Verify Installation

```bash
google-ads-cli --version
google-ads-cli --help
```

## Quick Start

### 1. Initial Setup

Configure your credentials:

```bash
google-ads-cli setup
```

You'll be prompted for:
- OAuth Client ID
- OAuth Client Secret
- Developer Token
- Customer ID (10 digits, no dashes)
- Login Customer ID (optional, for MCC accounts)

### 2. Authenticate

Run the OAuth flow to get access tokens:

```bash
google-ads-cli auth
```

This will:
1. Open your browser for Google authentication
2. Prompt you to authorize the application
3. Store access and refresh tokens securely

### 3. Start Using Commands

List your campaigns:

```bash
google-ads-cli campaigns
```

Generate keyword ideas:

```bash
google-ads-cli keyword-ideas "seo tools" "digital marketing"
```

## Usage

### Authentication Commands

#### Setup
```bash
google-ads-cli setup
```
Configure API credentials for a new profile.

#### Authenticate
```bash
google-ads-cli auth [-p <profile>]
```
Authenticate and obtain access tokens.

#### Logout
```bash
google-ads-cli logout [-p <profile>]
```
Clear stored credentials.

#### View Configuration
```bash
google-ads-cli config [-p <profile>]
```
Display current configuration.

#### Manage Profiles
```bash
# List all profiles
google-ads-cli profiles --list

# Switch active profile
google-ads-cli profiles --switch
```

### Account Commands

#### List Accessible Accounts
```bash
google-ads-cli accounts [--json]
```

### Campaign Commands

#### List Campaigns
```bash
google-ads-cli campaigns [-l <limit>] [--json]
```

Options:
- `-l, --limit <number>` - Maximum campaigns to return (default: 50)
- `--json` - Output as JSON

Example:
```bash
google-ads-cli campaigns -l 10
```

#### View Campaign Details
```bash
google-ads-cli campaign <campaign-id> [--json]
```

Example:
```bash
google-ads-cli campaign 1234567890
```

#### List Ad Groups
```bash
google-ads-cli ad-groups -c <campaign-id> [-l <limit>] [--json]
```

Options:
- `-c, --campaign-id <id>` - Campaign ID (required)
- `-l, --limit <number>` - Maximum ad groups to return (default: 50)

Example:
```bash
google-ads-cli ad-groups -c 1234567890
```

### Keyword Planner Commands

#### Generate Keyword Ideas
```bash
google-ads-cli keyword-ideas [keywords...] [options]
```

Options:
- `-u, --url <url>` - URL to get keyword ideas from
- `-l, --language <code>` - Language code (default: 1000 for English)
- `--location <codes...>` - Location codes (e.g., 2840 for USA)
- `--limit <number>` - Maximum ideas to return (default: 50)
- `--json` - Output as JSON

Examples:
```bash
# From seed keywords
google-ads-cli keyword-ideas "seo tools" "content marketing"

# From URL
google-ads-cli keyword-ideas -u https://example.com

# With location targeting (USA)
google-ads-cli keyword-ideas "digital marketing" --location 2840

# Multiple locations (USA and UK)
google-ads-cli keyword-ideas "software" --location 2840 2826
```

**Common Language Codes:**
- `1000` - English
- `1003` - Spanish
- `1005` - French
- `1001` - German
- [Full list](https://developers.google.com/google-ads/api/data/codes-formats#languages)

**Common Location Codes:**
- `2840` - United States
- `2826` - United Kingdom
- `2036` - Australia
- `2124` - Canada
- [Search locations](#search-locations)

#### Search Locations
```bash
google-ads-cli locations <search> [-l <limit>] [--json]
```

Options:
- `-l, --limit <number>` - Maximum results (default: 20)

Examples:
```bash
google-ads-cli locations "New York"
google-ads-cli locations "California"
google-ads-cli locations "United"
```

### Reporting Commands

#### Execute GAQL Query
```bash
google-ads-cli query <gaql> [-f <file>] [--json]
```

Options:
- `-f, --file <path>` - Read query from file
- `--json` - Output as JSON

Examples:
```bash
# Inline query
google-ads-cli query "SELECT campaign.id, campaign.name FROM campaign WHERE campaign.status = 'ENABLED' LIMIT 10"

# From file
google-ads-cli query "" -f query.gaql
```

Example GAQL queries:

**Top performing campaigns:**
```sql
SELECT
  campaign.id,
  campaign.name,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND metrics.impressions > 0
ORDER BY metrics.clicks DESC
LIMIT 10
```

**Keyword performance:**
```sql
SELECT
  ad_group_criterion.keyword.text,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.cost_micros
FROM keyword_view
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.impressions DESC
LIMIT 20
```

## Configuration

### Configuration Location

Credentials are stored in:
```
~/.google-ads-cli/config.json
```

File permissions are automatically set to `0600` (owner read/write only).

### Multi-Profile Support

Manage multiple Google Ads accounts:

```bash
# Create additional profiles during setup
google-ads-cli setup
# Enter a unique profile name when prompted

# List profiles
google-ads-cli profiles --list

# Switch active profile
google-ads-cli profiles --switch

# Use specific profile for a command
google-ads-cli campaigns -p my-other-account
```

## Output Formats

### Table Format (Default)

```bash
google-ads-cli campaigns

┌────────────┬─────────────────┬──────────┬────────┬─────────────┬────────┬──────────┐
│ ID         │ Name            │ Status   │ Type   │ Impressions │ Clicks │ Cost     │
├────────────┼─────────────────┼──────────┼────────┼─────────────┼────────┼──────────┤
│ 1234567890 │ My Campaign     │ ENABLED  │ SEARCH │ 10000       │ 150    │ $123.45  │
└────────────┴─────────────────┴──────────┴────────┴─────────────┴────────┴──────────┘
```

### JSON Format

```bash
google-ads-cli campaigns --json
```

```json
[
  {
    "campaign": {
      "id": "1234567890",
      "name": "My Campaign",
      "status": "ENABLED",
      "advertising_channel_type": "SEARCH"
    },
    "metrics": {
      "impressions": "10000",
      "clicks": "150",
      "cost_micros": "123450000"
    }
  }
]
```

## Troubleshooting

### "Not authenticated" Error

Run the auth command:
```bash
google-ads-cli auth
```

### "Developer token has not been approved" Error

Your developer token is in test mode. You can only access accounts you own or manage. For broader access, apply for Standard Access in the Google Ads API Center.

### "Customer not found" Error

Verify your Customer ID:
- Should be 10 digits (no dashes)
- Check in Google Ads top-right corner
- Update if needed: `google-ads-cli setup`

### "Token expired" Error

Tokens are automatically refreshed. If this persists, re-authenticate:
```bash
google-ads-cli auth
```

### Port 3000 Already in Use

The OAuth callback uses port 3000. Close conflicting applications or modify `src/auth/oauth.ts` to use a different port.

### OAuth Consent Screen Errors

Ensure:
- Your email is added as a test user
- Required scopes are added (`https://www.googleapis.com/auth/adwords`)
- Consent screen is published (at least in testing mode)

## API Limits

- **Keyword Planner API**: Rate-limited, cache results when possible
- **Test Developer Token**: Limited to 15,000 operations per day
- **Standard Access**: Higher limits after approval

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev -- <command>

# Examples
npm run dev -- setup
npm run dev -- campaigns
npm run dev -- keyword-ideas "test"
```

### Project Structure

```
google-ads-cli/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── cli.ts                # Commander setup
│   ├── auth/                 # Authentication logic
│   │   ├── oauth.ts
│   │   ├── credentials.ts
│   │   └── setup.ts
│   ├── api/
│   │   └── google-ads.ts     # Google Ads API wrapper
│   ├── commands/             # CLI command implementations
│   │   ├── auth.ts
│   │   ├── accounts.ts
│   │   ├── campaigns.ts
│   │   ├── keywords.ts
│   │   └── reports.ts
│   └── utils/                # Utilities
│       ├── config.ts
│       ├── profiles.ts
│       ├── validation.ts
│       └── formatting.ts
├── dist/                     # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [GAQL Reference](https://developers.google.com/google-ads/api/docs/query/overview)
- [google-ads-api npm package](https://www.npmjs.com/package/google-ads-api)
- [OAuth 2.0 Guide](https://developers.google.com/google-ads/api/docs/oauth/overview)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

This is an internal tool for OpenClaw. For issues or feature requests, please open an issue on GitHub.

## Author

Hayden Cassar

---

**Note**: This tool is designed for programmatic access and requires technical setup. It is not intended for end-users without API knowledge.

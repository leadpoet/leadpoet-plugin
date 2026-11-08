# Leadpoet plugin

Leadpoet turns your ideal customer profile into researched, qualified
companies and contacts, then moves them through your pipeline and outreach.
This plugin connects Claude Code, Cursor, Grok and Grok Bot to your Leadpoet
workspace: the hosted MCP server plus the `leadpoet-workspace` agent skill.
It also includes two free outbound skills that work without a Leadpoet
account.

## Free plan

Every Leadpoet plan, Free included, comes with the CRM pipeline, email and
LinkedIn outreach, HubSpot, Slack and webhooks, and a monthly allowance of AI
actions for writing outreach sequences. Credits pay only for new lead
requests, phone numbers and signals. [Start free](https://leadpoet.com/auth) ·
[Pricing](https://leadpoet.com/pricing)

## Install

Claude Code:

```sh
/plugin marketplace add leadpoet/leadpoet-plugin
/plugin install leadpoet@leadpoet
```

Cursor: install **Leadpoet** from the Cursor plugin directory, or add this
repository as a plugin.

Any other MCP client: add `https://leadpoet.com/mcp` as a remote (HTTP) server.

## Free outbound skills

These skills run on their own, with no Leadpoet account or API key. Each one
runs a small script (Node 18 or later, no install) for its checks and numbers,
so the agent doesn't guess.

| Skill | What it does |
| --- | --- |
| `outbound-planner` | Works out the companies, mailboxes and domains a meeting goal needs, how big an A/B test must be, and whether a result is a real winner. |
| `cold-email-review` | Runs the swap test on a cold email's reason for writing, checks length, pitch, ask and the legal basics, and rewrites it from the draft's own facts. |

Install one skill in any agent that supports skills:

```sh
npx skills add leadpoet/leadpoet-plugin --skill cold-email-review
```

Installing the plugin adds both.

## Requirements

The workspace tools need a Leadpoet workspace (the Free plan works). Every
workspace has API access unless an administrator turned it off.

## Sign in

The plugin adds the hosted MCP server `https://leadpoet.com/mcp`. Sign-in uses
OAuth 2.0 with PKCE, so there is no API key or client ID to configure. When you
first use a Leadpoet tool, sign in to Leadpoet and choose **Read only** or
**Read and edit**, and whether the app may send messages.

## What it can do

- Check credits, lead requests and their status.
- Review companies and contacts in your pipeline, and move them between stages.
- Build ideal customer profiles and audiences.
- Draft, review and launch outreach campaigns, and read replies and results.

Tools that send, spend credits or change records are labeled, so the app asks
before each call. Send tools appear only when you allow sending.

## Manage connections

Disconnect anytime in Leadpoet under Account → Integrations → AI assistants.

## Support

hello@leadpoet.com · [Documentation](https://leadpoet.com/docs/api#connectors)
· [Privacy](https://leadpoet.com/privacy-policy) · [Terms](https://leadpoet.com/terms)

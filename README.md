# Leadpoet plugin

Leadpoet is an AI sales platform: find verified B2B leads and buying signals,
run email and LinkedIn outreach, and manage your sales pipeline. This plugin
connects Claude Code, Cursor, Grok and Grok Bot to your Leadpoet workspace:
the hosted MCP server plus the `leadpoet-workspace` agent skill. It also
includes two free outbound skills that work without a Leadpoet account.

## Free plan

The Free plan includes the company, contact and deal pipeline; email or
LinkedIn outreach from a connected inbox or LinkedIn account; a monthly
allowance of AI actions for sequences, follow-ups and scheduled agent briefs;
reply and campaign tracking; HubSpot, Slack and webhooks; and Excel
export. A new account's first lead request is free: researched companies that
match your ideal customer profile, each with verified contacts. After that,
lead requests and Signals use credits. Current limits and credit costs are on
[the pricing page](https://leadpoet.com/pricing).

[Start free](https://leadpoet.com/auth)

## Install

Claude Code:

```sh
/plugin marketplace add leadpoet/leadpoet-plugin
/plugin install leadpoet@leadpoet
```

Cursor: add this repository as a plugin, or add the server from `mcp.json`.

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

A Leadpoet account; the Free plan works. The workspace owner or a team admin
connects. If you have no account, create one on the sign-in page that opens.

## Sign in

The plugin adds the hosted MCP server `https://leadpoet.com/mcp`. Sign-in uses
OAuth 2.0 with PKCE, so there is no API key or client ID to configure. When you
first use a Leadpoet tool, sign in to Leadpoet and choose **Read only** or
**Read and edit**, and whether the app may send messages.

## What it can do

- **Lead requests:** describe your ideal customer profile (ICP) and request
  researched, intent-scored B2B companies and contacts, delivered to your
  pipeline in 1–2 days. Repeat a request daily or weekly, or find more
  contacts at a company.
- **CRM pipeline:** see companies, contacts and deals by stage, move them, log
  notes, rate fit and add follow-up tasks. New Leadpoet leads go to a
  connected HubSpot.
- **Outreach:** build an audience and an email and LinkedIn campaign, with
  AI-written sequences for you to review. See who replied and what needs an
  answer, and how each campaign is doing. Sending uses the email inbox and
  LinkedIn account you connect in Leadpoet.
- **Signals:** see buying signals at the accounts you watch, such as funding,
  new jobs, leadership news and contacts who change jobs, each with its source.
- **Agent:** schedule a morning brief or weekly report from Leadpoet's agent,
  and save preferences it follows.
- **Team:** your team shares one workspace, with owners on companies and deals
  and everyone's fit ratings.

Try: "Request 25 verified companies that match my ideal customer profile",
"Draft a cold email and LinkedIn campaign for my new contacts", "Show my sales
pipeline by stage and flag deals that stalled", "Who replied to my outreach,
and what needs an answer today?" or "Every weekday at 8am, brief me on new
replies, signals and stalled deals."

Tools that send, spend credits or change records are labeled, so the app asks
before each call. Send tools appear only when you allow sending.

## Manage connections

Disconnect anytime in Leadpoet under Settings → Integrations → AI assistants.

## Support

hello@leadpoet.com · [Documentation](https://leadpoet.com/docs/api#connectors)
· [Privacy](https://leadpoet.com/privacy-policy) · [Terms](https://leadpoet.com/terms)

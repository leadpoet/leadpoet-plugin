# Leadpoet plugin

Leadpoet turns your ideal customer profile into researched, qualified
companies and contacts, then moves them through your pipeline and outreach.
This plugin connects Claude Code, Cursor, Grok and Grok Bot to your Leadpoet
workspace: the hosted MCP server plus the `leadpoet-workspace` agent skill.

## Install

Claude Code:

```sh
/plugin marketplace add leadpoet/leadpoet-plugin
/plugin install leadpoet@leadpoet
```

Cursor: install **Leadpoet** from the Cursor plugin directory, or add this
repository as a plugin.

Any other MCP client: add `https://leadpoet.com/mcp` as a remote (HTTP) server.

## Requirements

A Leadpoet workspace with API access. You must be able to manage the
workspace's API keys. [Request access](https://leadpoet.com/docs/api#access).

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

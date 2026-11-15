# Install the Leadpoet MCP server

Leadpoet is a hosted MCP server. There is nothing to clone, build or run
locally, and no API key or environment variable to set.

- Server URL: `https://leadpoet.com/mcp`
- Transport: Streamable HTTP
- Sign-in: OAuth 2.1 with PKCE and dynamic client registration

## Cline

Add this entry to `cline_mcp_settings.json` (MCP Servers → Configure → Configure
MCP Servers), merging it into any existing `mcpServers`:

```json
{
  "mcpServers": {
    "leadpoet": {
      "type": "streamableHttp",
      "url": "https://leadpoet.com/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Set `type` to `streamableHttp`; without it Cline uses the older SSE transport.

The first time the server connects, Cline asks to authenticate and opens the
browser. Sign in to Leadpoet (or create a free account on that page), then
choose **Read only** or **Read and edit**, and whether the app may send
messages. The browser returns to Cline and the Leadpoet tools appear.

## Other MCP clients

Add `https://leadpoet.com/mcp` as a remote (Streamable HTTP) server. Clients
that support MCP OAuth open the same sign-in page on first use.

## Check it works

Ask: "What is my Leadpoet credit balance?" The agent should call a Leadpoet
tool and answer from your workspace.

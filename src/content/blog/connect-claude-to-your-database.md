---
title: Connect Claude to your database with MCP
description: Give Claude Code, Claude Desktop, Cursor or VS Code access to your PostgreSQL, MySQL or MongoDB database through Stroke's built-in MCP server, with the access level you choose.
date: 2026-11-14
tags: AI, MCP, Claude
---

Coding agents write much better queries when they can see your real schema. The Model Context Protocol (MCP) is how they get it: the agent connects to an MCP server, and the server offers tools such as "list tables", "describe this table" and "run this query".

Stroke runs an MCP server inside the app, on your own machine. The agent works on the database you have open in Stroke, through the same connection, with the access level you set.

## 1. Turn on the MCP server

Open Stroke, connect to a database, and click **MCP** in the status bar. Start the server and pick an access level:

- **Read only:** SELECT and schema reads.
- **Read and write:** inserts, updates and deletes.
- **Schema changes:** CREATE, ALTER and DROP as well.
- **Full access:** everything.

The server listens on `127.0.0.1` only and every request needs the token shown in the panel.

## 2. Add Stroke to your client

Pick your client. The panel in the app shows the same snippets with your token filled in.

{{mcp-config}}

## 3. Ask

Ask the agent something only your database knows: "Which customers ordered twice last month?" It lists the tables, reads the ones it needs, writes the query and runs it.

## Why not give the agent a connection string?

You can, but then the agent holds your credentials and nothing stands between it and a `DROP TABLE`. With MCP through Stroke, the credentials stay in your Keychain, the access level is enforced on every call, and you can stop the server with one click.

Read more in [the MCP docs](/docs/mcp) or [letting AI agents query your database safely](/blog/ai-agents-and-your-database).

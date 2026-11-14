---
title: Letting AI agents query your database safely
description: Give Claude Code, Cursor or any MCP client access to your database, with the access level you choose.
date: 2026-11-14
tags: AI, MCP, Security
---

Coding agents are much better with your real schema in front of them. They stop guessing column names and start writing queries that run. The question is how much you let them do.

Stroke runs an **MCP server** inside the app. Any MCP client (Claude Code, Cursor, Codex and others) can connect to it and use the database you have open, through tools for listing tables, describing them and running SQL.

## Access levels

You choose what an agent may run, per session:

| Level          | What it allows                                                        |
| -------------- | --------------------------------------------------------------------- |
| Read only      | SELECT and friends. Writes are refused before they reach the database |
| Read and write | Inserts, updates and deletes, but no schema changes                   |
| Modify schema  | Also CREATE, ALTER and DROP                                           |
| Full access    | Everything                                                            |

The level is checked on each statement before it runs, for every engine Stroke supports, not just Postgres.

## The agent built into Stroke

If you'd rather not wire up an external tool, Stroke's own AI chat works the same way. It reads the schema first, shows each step it takes, retries what fails, and asks before anything destructive. It can also open a tab beside your tables instead of taking over the window.

## A sensible default

Start agents at **Read only** against production, and **Read and write** against a local copy. Raise it for the task, not for the session.

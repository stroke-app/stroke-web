---
title: A MongoDB GUI in the same app as your SQL databases
description: Browse collections, edit documents and run queries on MongoDB next to PostgreSQL and MySQL, with mongosh one tab away.
date: 2026-11-14
tags: MongoDB, NoSQL, Database client
---

Most teams run more than one kind of database: Postgres for the core data, MongoDB for documents, Redis for caching. Switching between three tools to follow one request through all three is slow.

## MongoDB in Stroke

- **Collections as tables.** Each collection opens in the grid, with fields as columns and nested documents as a tree.
- **Edit in place.** Change a field, add a document, delete one, and apply the changes together.
- **Queries and aggregation.** Run find queries and aggregation pipelines, with explain plans.
- **mongosh in a tab.** The shell, already connected, when you want it.
- **The AI agent speaks MongoDB.** It writes MongoDB queries, not SQL, when the connection is MongoDB.

## The same app for everything else

{{engines}}

Connect with a `mongodb://` or `mongodb+srv://` URL, or start MongoDB in Docker from the command palette and Stroke connects when it is ready.

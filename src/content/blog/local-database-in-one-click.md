---
title: A local Postgres, MySQL or MongoDB in one click
description: Skip the install guides. Start a database in Docker from Stroke's command palette and land in it, connected.
date: 2026-11-14
tags: Docker, PostgreSQL, Guides
---

Most of the time I need a database for an hour: to try a migration, reproduce a bug, or check how an ORM writes a query. Installing a server for that is overkill, and remembering each image's environment variables is worse.

So Stroke does it for you. Press **⌘K**, choose **Docker**, and pick one of 18 images:

- **Relational:** PostgreSQL 17 and 16, pgvector, PostGIS, TimescaleDB, MySQL 8.4, MariaDB 11, SQL Server 2022, Oracle Database Free, CockroachDB
- **Document and key-value:** MongoDB 8, Redis 7, Valkey 8, CouchDB 3, DynamoDB Local, Cassandra 5
- **Analytics:** ClickHouse, a libSQL server

## What happens when you pick one

1. Stroke pulls the image, streaming the progress.
2. It starts the container on the image's usual port, or the next free one if something already uses it.
3. It waits until the database actually answers. A Postgres image accepting TCP is not the same as Postgres being ready, so it runs a real query first.
4. It saves the connection and opens it.

The containers already running on your machine are listed at the top of the same page, so a database from `docker compose up` opens in one step too, with the credentials read from the container's environment.

## When you're done

They're ordinary containers. `docker rm -f` removes one, and the saved connection goes with a right-click.

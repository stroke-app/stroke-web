---
title: How to connect to Oracle from a Mac
description: Oracle Database on macOS, from a local container to a remote server, with the one setting that trips everyone up.
date: 2026-11-14
tags: Oracle, macOS, Guides
---

Oracle is the database people most often tell me they can't open on a Mac. The client tools assume Windows or Linux, and the error messages assume you already know Oracle. Here is the path that works, start to finish.

## 1. Get a database to talk to

If you already have a server, skip this. For a local one, Oracle Database Free runs in Docker:

```bash
docker run -d --name oracle -p 1521:1521 -e ORACLE_PASSWORD=oracle gvenzl/oracle-free:slim
```

It takes a minute or two the first time. `docker logs -f oracle` prints `DATABASE IS READY TO USE!` when it's up. In Stroke, **⌘K → Docker → Oracle Database Free** does the same thing and connects when it's ready.

## 2. Install Oracle Instant Client

Stroke talks to Oracle through Oracle's own client library, which Oracle doesn't allow anyone to bundle. Download **Instant Client Basic** (or Basic Light) for macOS from Oracle's site and unzip it. If the folder lands in your home folder, `~/Downloads` or `~/oracle`, Stroke finds it by itself. Anywhere else, point the connection's **Instant Client folder** at it.

## 3. Connect to the right container

This is the part that catches everyone. An Oracle server holds a root container (`CDB$ROOT`) and one or more pluggable databases. Your tables live in a pluggable database, usually called `FREEPDB1`, `XEPDB1` or `ORCLPDB1`.

Leave the service name blank and many servers put you in the root, where you see thousands of Oracle's own tables and none of yours. So set:

| Field        | Value                      |
| ------------ | -------------------------- |
| Host         | `localhost`                |
| Port         | `1521`                     |
| Service name | `FREEPDB1`                 |
| User         | `system`, or your app user |

Stroke's status bar shows the container you landed in, and warns you if it's the root.

## 4. Pasting a string instead

Every one of these works in the paste box on Stroke's connection screen:

- `oracle://app:secret@localhost:1521/FREEPDB1`
- `jdbc:oracle:thin:@//localhost:1521/FREEPDB1`
- an Easy Connect string, `localhost:1521/FREEPDB1`

## When it still won't connect

- **DPI-1047:** Instant Client wasn't found. Check the folder.
- **ORA-12514:** the listener doesn't know that service name. Check `FREEPDB1` against your server.
- **ORA-01017:** wrong user or password.

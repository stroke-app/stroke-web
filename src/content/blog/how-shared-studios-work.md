---
title: How Stroke shares a database without putting it online
description: A link that opens your database on any device, end-to-end encrypted, read-only by default. How the relay, the key in the link and the read-only gates work, with figures you can play with.
date: 2026-11-17
tags: Security, Sharing, Labs
---

Stroke can share the database you have open as a link. Whoever opens it gets the web studio on their own device: tables, rows, a SQL console. Nothing about your database is put on the internet, nothing has to be opened on your network, and stroke.click, which passes the messages along, can't read any of them.

Start it with `npx strokedb --share`, or from the desktop app with Settings → Labs → Share as a web studio. This post is how it works, one piece at a time.

## Why a link can't just point at your laptop

Your database runs on your laptop, at an address like `127.0.0.1` that only means something on that machine. Between it and the rest of the internet sits your router, which hands one public address to every device in the house. Pick a route and watch a browser on a phone try to reach the laptop:

{{share-reach}}

Sent straight at your network, the request stops at the router. It has no idea which device it was meant for, and nothing in your network asked for it. Sent through the relay, both sides make the trip **outward**, to a server at stroke.click that both of them can reach.

## A connection that starts on your side

The trick is who opens the connection. Routers and firewalls drop connections that start outside, but they let your own devices connect out, and once a connection is open, traffic flows both ways on it. Switch between the two directions:

{{share-outbound}}

Notice that the purple calls come back on the green connection your laptop opened. That's the whole idea: when you start sharing, your machine opens one connection to the relay and keeps it open. The other person's browser talks to the relay; the relay sends each call down that open connection. There's no port to forward, and it works behind home Wi-Fi, office firewalls and phone hotspots alike.

## The link, and the part no server sees

A share link carries two values made fresh for each share: a **room** on the relay, and a **key**. Switch the view to see what a server gets when the link is opened:

{{share-link}}

Everything after the `#` is the fragment. Browsers use it on the page but never send it in a request, so the server sees `GET /studio` and nothing else. The purple room and the orange key reach the studio page in the other person's browser, and stop there.

The room is 128 random bits, so it can't be guessed. The key is 256 random bits, and it's what makes the relay blind.

## Locking every call

Each time the studio wants something (a table's rows, a query's result) it writes the request, then encrypts it with the key using AES-256-GCM, one of the ciphers HTTPS uses. Type a query, then change one letter, or send the same one again:

{{share-seal}}

The purple bytes are all anyone in the middle ever sees. Change one character, or send the same query again, and the whole block is different: every message gets a fresh random IV, so not even two identical calls can be matched up. The 16 orange bytes at the end are the tag, which matters next.

## What the relay sees

The relay holds no key. It gets a sealed call, looks at which room it's for, and sends it down that room's open connection. Your machine opens it, runs it, seals the answer and sends it back the same way. Switch between looking from the ends and from inside the relay:

{{share-relay}}

From inside, every call is the same: some bytes, of some size, at some time, for some room. The query and the rows only exist as text at the two ends, the blue browser and your green machine, because those are the only places the key is.

This is also why I didn't route the share through ngrok or a tunnel: a tunnel decrypts traffic at its edge, and whoever runs it could read what passes. Here there's nothing for the relay to read.

## A wrong key, a changed byte

GCM does more than hide the content. The tag at the end is computed from the key and every byte of the message, so the receiver can tell whether a message is real before it decrypts anything. Try to open a sealed call three ways:

{{share-tamper}}

Only the link's key on untouched bytes opens it. A guessed key fails, and so does the real key on a message with one bit flipped: the tag no longer matches, and the receiver throws the message away. Someone who could change traffic on the relay still couldn't slip a query in, or alter one on its way.

## Read-only, enforced twice

A share is read-only unless you ask for edits (`--write` in the CLI, or Allow edits in the app). I didn't want that to rest on hiding a button, or on one check that a clever statement might get past, so a statement from a read-only share has to pass two gates. Pick one and watch where it stops:

{{share-readonly}}

The first gate is a filter: one statement at a time, and it has to read (SELECT, WITH, EXPLAIN, SHOW). A plain DELETE stops there, and so does `SELECT 1; DELETE …`, which tries to hide a write behind a read.

The second gate is the database itself. On a read-only share, each statement runs alone inside a read-only transaction that's always rolled back: `BEGIN READ ONLY` on Postgres, `START TRANSACTION READ ONLY` on MySQL, and a SQLite file opened read-only. A `WITH … DELETE` looks like a read and gets past the filter, then Postgres refuses the write itself. Even a SET that changes the session's settings is undone when the transaction rolls back.

In the desktop app, a read-only share uses the same read-only path the app's MCP server gives AI agents.

## Only you can serve the room

The link gets someone into the room as a viewer. It doesn't let them stand in for your machine. When your machine first connects to a room, it shows a third random value, a secret that's never in the link, and the room remembers it. Try both:

{{share-claim}}

If your Wi-Fi drops, your machine reconnects with the same secret and the same link works again. Someone who only has the link can't take the room over to answer calls with data of their own: the relay turns them away.

## Stopping

Sharing lasts as long as you let it. Press Ctrl+C in the terminal, Stop sharing in the app, or disconnect, and the open connection closes. Move the stop and scrub through time:

{{share-stop}}

After the stop, the relay doesn't wait for an answer that won't come: every call comes back straight away as offline, and the studio says the share stopped. A new share makes a new room and a new key, so an old link stays dead.

## What it doesn't protect against

Anyone with the link can read everything in that database while you share it. That's the point of the link, so send it the way you'd send a password, to people you'd let read that data. Read-only stops them changing things. It doesn't stop them reading, copying or exporting.

The relay can see when you share, for how long, and roughly how much data goes back and forth, though not what it is. And a share depends on your machine: when it sleeps or goes offline, the link pauses until it's back.

## Try it

```sh
npx strokedb --share ./dev.db
```

Or in the desktop app: Settings → Labs → **Share as a web studio**, then **Share as web studio** in the command palette. It works with PostgreSQL, MySQL and SQLite.

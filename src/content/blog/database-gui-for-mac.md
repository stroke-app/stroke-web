---
title: A database GUI for Mac that feels like a Mac app
description: What to look for in a macOS database client, and how to browse, edit and query Postgres, MySQL, SQLite and MongoDB on a Mac without a Java runtime.
date: 2026-11-14
tags: macOS, Database client, GUI
---

Most database tools on a Mac fall into two groups: Java and Electron apps that run everywhere, and native apps built for one platform. Both work. The difference shows up after a few hours: how fast a table opens, whether the keyboard shortcuts match the rest of macOS, and how warm the laptop gets.

## What makes a good Mac database client

- **It opens fast.** You open a database client dozens of times a day. Seconds add up.
- **Keyboard first.** ⌘K to jump anywhere, ⌘T for a query tab, ⌘W to close it. If you reach for the mouse to switch tables, something is missing.
- **It respects the system.** Passwords in the macOS Keychain, not in a plain file. Light and dark that follow the system.
- **It is light on memory.** A grid that holds a hundred thousand rows should not need a gigabyte.

## Stroke on macOS

Stroke is a native app with a Rust core and the system webview, so it starts quickly and stays small. Passwords, AI keys and provider tokens live in the Keychain. Every view has a shortcut, and a leader key (⌘; then one letter) reaches the rest.

It connects to these databases:

{{engines}}

## Install

Download the `.dmg` from [stroke.click/download](/download), or with Homebrew:

```
brew install --cask stroke-app/tap/stroke
```

The Mac build is ad-hoc signed, so the first launch needs one step: run `xattr -cr /Applications/Stroke.app`, or right-click the app and choose Open.

## How it compares

{{compare}}

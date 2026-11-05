#!/usr/bin/env node
import { runAudit } from "../../../src/auditor.js";

const target = process.argv[2] || ".";
runAudit(target).catch(console.error);

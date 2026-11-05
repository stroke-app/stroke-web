#!/usr/bin/env node
import { runSchemaCli } from "../../../src/schema-generator.js";

const type = process.argv[2] || "article";
runSchemaCli(type);

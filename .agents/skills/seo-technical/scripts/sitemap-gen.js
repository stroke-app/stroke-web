#!/usr/bin/env node
import { generateSitemap } from "../../../src/sitemap-generator.js";

const url = process.argv[2] || "https://example.com";
generateSitemap(url);

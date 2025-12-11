#!/usr/bin/env node
/**
 * Simple Mongo backup script using mongodump.
 * Requires mongodump installed on the host (from MongoDB tools).
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error("Missing Mongo connection string. Set MONGODB_URI (or MONGO_URI) in backend/.env");
  process.exit(1);
}

const outDir = path.join(__dirname, "..", "backups");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const dumpPath = path.join(outDir, `dump-${timestamp}`);

const args = ["--uri", uri, "--out", dumpPath];
console.log(`Running mongodump to ${dumpPath}`);
const proc = spawn("mongodump", args, { stdio: "inherit" });

proc.on("close", (code) => {
  if (code === 0) {
    console.log(`Backup completed: ${dumpPath}`);
  } else {
    console.error(`mongodump exited with code ${code}`);
    process.exit(code);
  }
});

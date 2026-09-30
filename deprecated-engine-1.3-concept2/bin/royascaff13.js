#!/usr/bin/env node

const { run } = require("../lib/cli");

run(process.argv).catch((error) => {
  console.error(`Error: ${error.message}`);
  if (process.env.ROYASCAFF_DEBUG) console.error(error.stack);
  process.exitCode = 1;
});

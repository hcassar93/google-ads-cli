#!/usr/bin/env node

import { program } from './cli.js';

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

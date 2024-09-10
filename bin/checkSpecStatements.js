#!/usr/bin/env node

import {argv} from 'node:process';
import {writeFile} from 'node:fs/promises';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

yargs(hideBin(argv))
  .scriptName('specStatements')
  .usage('Usage: $0 <command>')
  .command(
    'check',
    'Checks the spec\'s normative statements again the specs specified',
    {
      handler: checkSpecHandler,
      builder: _yargs => _yargs
        .option('specUrl', {
          type: 'string',
          describe: 'The URL of a specification',
          demandOption: true
        })
        .option('suiteLog', {
          type: 'string',
          describe: 'The path to the suiteLog',
          demandOption: true
        })
    }
  ).demandCommand().argv;

async function checkSpecHandler(commands) {
}

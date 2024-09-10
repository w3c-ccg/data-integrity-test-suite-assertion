#!/usr/bin/env node

import {argv} from 'node:process';
import {checkSpecText} from './handlers.js';
import {hideBin} from 'yargs/helpers';
import yargs from 'yargs';

yargs(hideBin(argv))
  .scriptName('specStatements')
  .usage('Usage: $0 <command>')
  .command(
    'check',
    'Checks the spec\'s normative statements again the specs specified',
    {
      handler: checkSpecText,
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

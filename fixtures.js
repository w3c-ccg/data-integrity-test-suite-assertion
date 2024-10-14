/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */

import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

export const unsecured = new Map([
  ['1.1', require('./inputs/credentials/v1.1/unsecured.json')],
  ['2.0', require('./inputs/credentials/v2.0/unsecured.json')]
]);

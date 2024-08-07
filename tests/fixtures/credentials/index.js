/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {createRequire} from 'node:module';
// FIXME remove this once node has non-experimental support
// for importing json via import
// @see https://nodejs.org/api/esm.html#json-modules
const require = createRequire(import.meta.url);

export const versionedCredentials = new Map([
  ['1.1', require('./v1.json')],
  ['2.0', require('./v2.json')]
]);

/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {createRequire} from 'node:module';

//FIXME remove this once node has non-experimental support
//for es6 import and json
const require = createRequire(import.meta.url);

export async function getMultiKey({serializedKeys, multikey, keyType}) {
  const keyDir = './';
  if(typeof serializedKeys === 'string') {
    return multikey.from(require(`${keyDir}/${serializedKeys}`));
  }
  const keyPath = serializedKeys[keyType];
  if(!keyPath) {
    throw new Error(`Unrecognized keyType ${keyType}.`);
  }
  return multikey.from(require(`${keyDir}/${keyPath}`));
}

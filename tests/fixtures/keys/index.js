/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {cryptosuites} from '../constants.js';

export async function getKeyPair({suiteName, keyType}) {
  const {serializedKeys, multikey} = cryptosuites.get(suiteName);
  const keyDir = './keys';
  if(!serializedKeys) {
    throw new Error(`Unrecognized suite: ${suiteName}`);
  }
  if(typeof serializedKeys === 'string') {
    return multikey.from(require(`${keyDir}/${serializedKeys}`));
  }
  const keyPath = serializedKeys[keyType];
  if(!keyPath) {
    throw new Error(`Unrecognized keyType ${keyType} for suite ${suiteName}`);
  }
  return multikey.from(require(`${keyDir}/${keyPath}`));
}

export async function getMultiKey({suiteName, keyType}) {
  const keyPair = await getKeyPair({suiteName, keyType});
  return {issuer: keyPair.controller, signer: keyPair.signer()};
}

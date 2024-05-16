/*!
 * Copyright 2023-24 Digital Bazaar, Inc. All Rights Reserved
 */
import {createRequire} from 'node:module';
import {cryptosuites} from './constants.js';

const require = createRequire(import.meta.url);

// This is only used inside this test suite for generating vcs for the verify
// proof tests.
export const TEST_KEY_SEED =
  'z1AZVaiqEq3kXaf4DJD5qXUfdJBFbW1JNe4FF58HwMgVE6u';

export async function getKeyPair({suiteName, keyType}) {
  const {serializedKeys, multikey} = cryptosuites.get(suiteName);
  const keyDir = './keys';
  if(!serializedKeys) {
    throw new Error(`Unrecognized suite: ${suite}`);
  }
  if(typeof serializedKeys === 'string') {
    return multikey.from(require(`${keyDir}/${serializedKeys}`));
  }
  const keyPath = serializedKeys[keyType];
  if(!keyPath) {
    throw new Error(`Unrecognized keyType ${keyType} for suite ${suite}`);
  }
  return multikey.from(require(`${keyDir}/${keyPath}`));
}

export async function getMultiKey({suiteName, keyType}) {
  const keyPair = await getKeyPair({suiteName, keyType});
  return {issuer: keyPair.controller, signer: keyPair.signer()};
}

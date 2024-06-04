/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
export async function getKeyPair({serializedKeys, multikey, keyType}) {
  const keyDir = './keys';
  if(typeof serializedKeys === 'string') {
    return multikey.from(require(`${keyDir}/${serializedKeys}`));
  }
  const keyPath = serializedKeys[keyType];
  if(!keyPath) {
    throw new Error(`Unrecognized keyType ${keyType}.`);
  }
  return multikey.from(require(`${keyDir}/${keyPath}`));
}

export async function getMultiKey({serializedKeys, multikey, keyType}) {
  const keyPair = await getKeyPair({serializedKeys, multikey, keyType});
  return {issuer: keyPair.controller, signer: keyPair.signer()};
}

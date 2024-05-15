/*!
 * Copyright 2023-24 Digital Bazaar, Inc. All Rights Reserved
 */
// This is only used inside this test suite for generating vcs for the verify
// proof tests.
export const TEST_KEY_SEED =
  'z1AZVaiqEq3kXaf4DJD5qXUfdJBFbW1JNe4FF58HwMgVE6u';

// should contain an entry for cryptosuite suite tested
const serializedKeyPairs = {
  'ecdsa-rdfc-2019': {
    'P-256': 'ecdsa/p256KeyPair.json',
    'P-384': 'ecdsa/p384KeyPair.json'
  },
  'ecdsa-sd-2023': {
    'P-256': 'ecdsa/p256KeyPair.json'
  },
  'eddsa-2023': 'eddsa/p25519KeyPair.json',
  'eddsa-rdfc-2022': 'eddsa/p25519KeyPair.json',
  'bbs-2023': {
    'P-381': 'bbs/p381KeyPair.json'
  }
};

export async function getSerializedKeyPair({suite, keyType}) {
  const keySection = serializedKeyPairs[suite];
  const keyDir = './keys/';
  if(!keySection) {
    throw new Error(`Unrecognized suite: ${suite}`);
  }
  if(typeof keySection === 'string') {
    return keySection;
  }
  const keyPath = keySection[keyType];
  if(!keyPath) {
    throw new Error(`Unrecognized keyType ${keyType} for suite ${suite}`);
  }
  return keyPath;
}

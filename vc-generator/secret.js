/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
// This is only used inside this test suite for generating vcs for the verify
// proof tests.
export const TEST_KEY_SEED =
  'z1AZVaiqEq3kXaf4DJD5qXUfdJBFbW1JNe4FF58HwMgVE6u';
const P256 = '';

// should contain an entry for cryptosuite suite tested
const secretKeys = {
  'ecdsa-rdfc-2019': {
    'P-256': ''
  },
  'ecdsa-sd-2023': {
    'P-256': ''
  },
  'eddsa-2023': {

  },
  'bbs-2023': {

  }
};

export function getSeed({suite, keyType}) {
  const seeds = secretKeys[suite];
  // in order to make this backwards compatible
  // return the original eddsa seed
  return seeds?.[keyType] || TEST_KEY_SEED;
}

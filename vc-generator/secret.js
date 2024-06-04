/*!
 * Copyright 2023-24 Digital Bazaar, Inc. All Rights Reserved
 */
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';

// This is only used inside this test suite for generating vcs for the verify
// proof tests.
export const TEST_KEY_SEED =
  'z1AZVaiqEq3kXaf4DJD5qXUfdJBFbW1JNe4FF58HwMgVE6u';

export const getDefaultKey = async () =>
  Ed25519Multikey.generate({seed: TEST_KEY_SEED});

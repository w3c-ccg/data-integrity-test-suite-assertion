/*!
 * Copyright 2023-24 Digital Bazaar, Inc. All Rights Reserved
 */
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';

// This is only used inside this test suite for generating vcs for the verify
// proof tests.
export const TEST_KEY_SEED =
  'z1AZVaiqEq3kXaf4DJD5qXUfdJBFbW1JNe4FF58HwMgVE6u';
const TEST_KEY_PAIR = {
  "id": "did:key:z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT#z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT",
  "@context": "https://w3id.org/security/multikey/v1",
  "type": "Multikey",
  "controller": "did:key:z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT",
  "publicKeyMultibase": "z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT",
  "secretKeyMultibase": "zrv3rbPamVDGvrm7LkYPLWYJ35P9audujKKsWn3x29EUiGwwhdZQd1iHhrsmZidtVALBQmhX3j9E5Fvx6Kr29DPt6LH"
};

export const getDefaultKey = async () =>
  Ed25519Multikey.from(TEST_KEY_PAIR);

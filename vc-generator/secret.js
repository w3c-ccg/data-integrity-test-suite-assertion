/*!
 * Copyright 2023-24 Digital Bazaar, Inc. All Rights Reserved
 */
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';

// This is only used inside this test suite for generating vcs for the verify
// proof tests.
const TEST_KEY_PAIR = {
  id: 'did:key:z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT#z6MkwXG2Wje' +
    'QnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT',
  '@context': 'https://w3id.org/security/multikey/v1',
  type: 'Multikey',
  controller: 'did:key:z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT',
  publicKeyMultibase: 'z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT',
  secretKeyMultibase: 'zrv3rbPamVDGvrm7LkYPLWYJ35P9audujKKsWn3x29EUiGwwhdZ' +
    'Qd1iHhrsmZidtVALBQmhX3j9E5Fvx6Kr29DPt6LH'
};

export const getDefaultKey = async () => Ed25519Multikey.from(TEST_KEY_PAIR);

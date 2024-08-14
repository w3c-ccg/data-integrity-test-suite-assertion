/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as Bls12381Multikey from '@digitalbazaar/bls12-381-multikey';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import {createDocLoader} from '../../index.js';
import {
  Ed25519VerificationKey2020
} from '@digitalbazaar/ed25519-verification-key-2020';

export const documentLoader = createDocLoader({
  keyTypes: [{
    header: 'zUC7',
    fromMultibase: Bls12381Multikey.from
  }, {
    header: 'z6Mk',
    fromMultibase: Ed25519VerificationKey2020.from
  }, {
    header: 'zDna',
    fromMultibase: EcdsaMultikey.from
  }, {
    header: 'z82L',
    fromMultibase: EcdsaMultikey.from
  }]
});

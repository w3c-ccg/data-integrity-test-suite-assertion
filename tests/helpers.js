/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 */
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';

export function createSuite({cryptosuite, signer, mandatoryPointers}) {
  if(mandatoryPointers) {
    return new DataIntegrityProof({
      signer,
      cryptosuite: cryptosuite.createSignCryptosuite({mandatoryPointers})
    });
  }
  return new DataIntegrityProof({
    signer,
    cryptosuite
  });
}

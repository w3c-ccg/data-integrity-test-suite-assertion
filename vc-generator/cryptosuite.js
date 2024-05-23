/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';

export function getSuites({
  signer,
  cryptosuite,
  mandatoryPointers,
  selectivePointers,
  verify
}) {
  const suite = getSuite({
    signer,
    cryptosuite,
    mandatoryPointers,
    verify
  });
  const selectiveSuite = selectivePointers ? getSuite({
    signer,
    cryptosuite,
    selectivePointers,
    verify
  }) : null;
  return {suite, selectiveSuite};
}

/**
 * Takes in a suite and signer and create a DataIntegrityProof with
 * the correct cryptosuite and options.
 *
 * @param {object} options - Options to use.
 * @param {string} options.cryptosuite - A cryptosuite.
 * @param {object} options.signer - A key to sign with.
 * @param {Array<string>} options.mandatoryPointers - An Array of JSON pointers.
 * @param {Array<string>} options.selectivePointers -An Array of JSON pointers.
 * @param {boolean} options.verify - Is the suite for verification?
 *
 * @returns {DataIntegrityProof} Returns a D.I. Proof w/ cryptosuite set.
 */
export function getSuite({
  signer,
  cryptosuite,
  mandatoryPointers,
  selectivePointers,
  verify
}) {
  if(mandatoryPointers || selectivePointers || verify) {
    return _getPointersProof({
      signer,
      cryptosuite,
      mandatoryPointers,
      selectivePointers,
      verify
    });
  }
  return new DataIntegrityProof({
    signer,
    cryptosuite
  });
}

function _getPointersProof({
  cryptosuite,
  signer,
  mandatoryPointers,
  selectivePointers,
  verify
}) {
  if(mandatoryPointers) {
    return new DataIntegrityProof({
      signer,
      cryptosuite: cryptosuite.createSignCryptosuite({
        mandatoryPointers
      })
    });
  }
  if(selectivePointers) {
    return new DataIntegrityProof({
      signer,
      cryptosuite: cryptosuite.createDiscloseCryptosuite({
        selectivePointers
      })
    });
  }
  if(verify) {
    return new DataIntegrityProof({
      cryptosuite: cryptosuite.createVerifyCryptosuite()
    });
  }
  throw new Error(`_getPointersProof requires either mandatoryPointers, ` +
      `selectivePointers, or verify.`);
}

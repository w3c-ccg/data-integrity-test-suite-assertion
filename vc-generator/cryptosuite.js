/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {cryptosuites} from './constants.js';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';

export function getSuites({
  suiteName,
  signer,
  mandatoryPointers,
  selectivePointers,
  verify
}) {
  const suite = getSuite({
    suiteName,
    signer,
    mandatoryPointers,
    verify
  });
  const selectiveSuite = selectivePointers ? getSuite({
    suiteName,
    signer,
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
 * @param {string} options.suiteName - A cryptosuite name.
 * @param {object} options.signer - A key to sign with.
 * @param {Array<string>} options.mandatoryPointers - An Array of JSON pointers.
 * @param {Array<string>} options.selectivePointers -An Array of JSON pointers.
 * @param {boolean} options.verify - Is the suite for verification?
 *
 * @returns {DataIntegrityProof} Returns a D.I. Proof w/ cryptosuite set.
 */
export function getSuite({
  suiteName,
  signer,
  mandatoryPointers,
  selectivePointers,
  verify
}) {
  switch(suiteName) {
    case `bbs-2023`: {
      return _getPointersProof({
        suiteName,
        signer,
        mandatoryPointers,
        selectivePointers,
        verify
      });
    }
    case 'ecdsa-rdfc-2019': {
      return _getProof({
        suiteName,
        signer
      });
    }
    case 'ecdsa-sd-2023': {
      return _getPointersProof({
        suiteName,
        signer,
        mandatoryPointers,
        selectivePointers,
        verify
      });
    }
    case 'eddsa-2022': {
      return _getProof({
        suiteName,
        signer
      });
    }
    case 'eddsa-rdfc-2022': {
      return _getProof({
        suiteName,
        signer
      });
    }
    default:
      throw new Error(`Unsupported cryptosuite suite: ${suiteName}`);
  }
}

function _getProof({
  suiteName,
  signer
}) {
  const {cryptosuite} = cryptosuites.get(suiteName);
  return new DataIntegrityProof({
    signer,
    cryptosuite
  });
}

function _getPointersProof({
  suiteName,
  signer,
  mandatoryPointers,
  selectivePointers,
  verify
}) {
  const {cryptosuite} = cryptosuites.get(suiteName);
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
  throw new Error(`Suite "${suiteName}" requires either mandatoryPointers, ` +
      `selectivePointers, or verify.`);
}

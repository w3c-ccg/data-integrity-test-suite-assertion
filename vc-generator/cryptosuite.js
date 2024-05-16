/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {cryptosuites} from './constants.js';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';

/**
 * Takes in a suite and signer and create a DataIntegrityProof with
 * the correct cryptosuite and options.
 *
 * @param {object} options - Options to use.
 * @param {string} options.suite - A cryptosuite name.
 * @param {object} options.signer - A key to sign with.
 * @param {Array<string>} options.mandatoryPointers - An Array of JSON pointers.
 * @param {Array<string>} options.selectivePointers -An Array of JSON pointers.
 * @param {boolean} options.verify - Is the suite for verification?
 *
 * @returns {DataIntegrityProof} Returns a D.I. Proof w/ cryptosuite set.
 */
export const getSuite = ({
  suite,
  signer,
  mandatoryPointers,
  selectivePointers,
  verify
}) => {
  switch(suite) {
    case `bbs-2023`: {
      return _getPointersProof({
        suite,
        signer,
        mandatoryPointers,
        selectivePointers,
        verify
      });
    }
    case 'ecdsa-rdfc-2019': {
      return _getProof({
        suite,
        signer
      });
    }
    case 'ecdsa-sd-2023': {
      return _getPointersProof({
        suite,
        signer,
        mandatoryPointers,
        selectivePointers,
        verify
      });
    }
    case 'eddsa-2022': {
      return _getProof({
        suite,
        signer
      });
    }
    case 'eddsa-rdfc-2022': {
      return _getProof({
        suite,
        signer
      });
    }
    default:
      throw new Error(`Unsupported cryptosuite suite: ${suite}`);
  }
};

function _getProof({
  suite,
  signer
}) {
  const {cryptosuite} = cryptosuites.get(suite);
  return new DataIntegrityProof({
    signer,
    cryptosuite
  });
}

function _getPointersProof({
  suite,
  signer,
  mandatoryPointers,
  selectivePointers,
  verify
}) {
  const {cryptosuite} = cryptosuites.get(suite);
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
  throw new Error(`Suite "${suite}" requires either mandatoryPointers, ` +
      `selectivePointers, or verify.`);
}

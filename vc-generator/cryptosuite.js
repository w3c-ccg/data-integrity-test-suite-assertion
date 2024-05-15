/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as bbs2023Cryptosuite from '@digitalbazaar/bbs-2023-cryptosuite';
import * as ecdsaSd2023Cryptosuite from
  '@digitalbazaar/ecdsa-sd-2023-cryptosuite';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {
  cryptosuite as ecdsaRdfc2019Cryptosuite
} from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import {cryptosuite as eddsaRdfc2022CryptoSuite} from
  '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';

const cryptosuites = new Map([
  ['ecdsa-sd-2023', ecdsaSd2023Cryptosuite],
  ['bbs-2023', bbs2023Cryptosuite],
  ['ecdsa-rdf-2019', ecdsaRdfc2019Cryptosuite],
  ['eddsa-rdfc-2022', eddsaRdfc2022CryptoSuite]
]);

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
  return new DataIntegrityProof({
    signer,
    cryptosuite: cryptosuites.get(suite)
  });
}

function _getPointersProof({
  suite,
  signer,
  mandatoryPointers,
  selectivePointers,
  verify
}) {
  const _cryptosuite = cryptosuites.get(suite);
  if(mandatoryPointers) {
    return new DataIntegrityProof({
      signer,
      cryptosuite: _cryptosuite.createSignCryptosuite({
        mandatoryPointers
      })
    });
  }
  if(selectivePointers) {
    return new DataIntegrityProof({
      signer,
      cryptosuite: _cryptosuite.createDiscloseCryptosuite({
        selectivePointers
      })
    });
  }
  if(verify) {
    return new DataIntegrityProof({
      cryptosuite: _cryptosuite.createVerifyCryptosuite()
    });
  }
  throw new Error(`Suite "${suite}" requires either mandatoryPointers, ` +
      `selectivePointers, or verify.`);
}

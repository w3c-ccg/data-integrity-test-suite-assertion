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

export const getSuite = ({
  suite,
  signer,
  mandatoryPointers,
  selectivePointers,
  verify
}) => {
  switch(suite) {
    case `bbs-2023`: {
      if(mandatoryPointers) {
        return new DataIntegrityProof({
          signer,
          cryptosuite: bbs2023Cryptosuite.createSignCryptosuite({
            mandatoryPointers
          })
        });
      }
      if(selectivePointers) {
        return new DataIntegrityProof({
          signer,
          cryptosuite: bbs2023Cryptosuite.createDiscloseCryptosuite({
            selectivePointers
          })
        });
      }
      if(verify) {
        return new DataIntegrityProof({
          cryptosuite: bbs2023Cryptosuite.createVerifyCryptosuite()
        });
      }
      throw new Error('Suite "bbs-2023" requires either mandatory or ' +
        'selective pointers');
    }
    case 'ecdsa-rdfc-2019': {
      return ecdsaRdfc2019Cryptosuite;
    }
    case `ecdsa-sd-2023`: {
      if(mandatoryPointers) {
        return ecdsaSd2023Cryptosuite.createSignCryptosuite({
          mandatoryPointers
        });
      }
      if(selectivePointers) {
        return ecdsaSd2023Cryptosuite.createDiscloseCryptosuite({
          selectivePointers
        });
      }
    }
    default:
      throw new Error(`Unsupported cryptosuite suite: ${suite}`);
  }
};

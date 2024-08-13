/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as bbs2023Cryptosuite from '@digitalbazaar/bbs-2023-cryptosuite';
import * as Bls12381Multikey from '@digitalbazaar/bls12-381-multikey';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import * as ecdsaSd2023Cryptosuite from
  '@digitalbazaar/ecdsa-sd-2023-cryptosuite';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {
  cryptosuite as ecdsaRdfc2019Cryptosuite
} from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
import {cryptosuite as eddsaRdfc2022CryptoSuite} from
  '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import {getMultiKey} from './keys/index.js';

export const cryptosuites = [{
  suiteName: 'ecdsa-sd-2023',
  keyType: 'P-256',
  derived: true,
  mandatoryPointers: ['/issuer'],
  selectivePointers: ['/credentialSubject/id'],
  optionalTests: {
    created: true,
    authentication: true
  },
  cryptosuite: ecdsaSd2023Cryptosuite,
  multikey: EcdsaMultikey,
  serializedKeys: {
    'P-256': 'ecdsa/p256KeyPair.json',
  }
},
{
  suiteName: 'bbs-2023',
  keyType: 'P-381',
  derived: true,
  mandatoryPointers: ['/issuer'],
  selectivePointers: ['/credentialSubject/id'],
  optionalTests: {
    //bbs deletes created in order to prevent data leakages
    created: false,
    authentication: true
  },
  cryptosuite: bbs2023Cryptosuite,
  multikey: Bls12381Multikey,
  serializedKeys: {
    'P-381': 'bbs/p381KeyPair.json',
  }
},
{
  suiteName: 'ecdsa-rdfc-2019',
  keyType: 'P-256',
  optionalTests: {
    created: true,
    authentication: true
  },
  cryptosuite: ecdsaRdfc2019Cryptosuite,
  multikey: EcdsaMultikey,
  serializedKeys: {
    'P-256': 'ecdsa/p256KeyPair.json',
  }
}, {
  suiteName: 'ecdsa-rdfc-2019',
  keyType: 'P-384',
  optionalTests: {
    created: true,
    authentication: true
  },
  cryptosuite: ecdsaRdfc2019Cryptosuite,
  multikey: EcdsaMultikey,
  serializedKeys: {
    'P-384': 'ecdsa/p384KeyPair.json'
  }
}, {
  suiteName: 'eddsa-2022',
  optionalTests: {
    created: true,
    authentication: true
  },
  cryptosuite: eddsa2022CryptoSuite,
  multikey: Ed25519Multikey,
  serializedKeys: 'eddsa/p25519KeyPair.json'
}, {
  suiteName: 'eddsa-rdfc-2022',
  optionalTests: {
    created: true,
    authentication: true
  },
  cryptosuite: eddsaRdfc2022CryptoSuite,
  multikey: Ed25519Multikey,
  serializedKeys: 'eddsa/p25519KeyPair.json'
}];

// perform basic setup here
for(const suite of cryptosuites) {
  const {serializedKeys, multikey, keyType} = suite;
  suite.key = await getMultiKey({
    serializedKeys, multikey, keyType
  });
}

export const verifierSuites = cryptosuites.map(({
  cryptosuite,
  mandatoryPointers,
  derived
}) => {
console.log({derived, mandatoryPointers, cryptosuite});
  if(derived) {
    return new DataIntegrityProof({
      cryptosuite: cryptosuite.createVerifyCryptosuite({mandatoryPointers})
    });
  }
  return new DataIntegrityProof({
    cryptosuite
  });
});

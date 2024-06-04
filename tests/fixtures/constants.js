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
import {
  cryptosuite as ecdsaRdfc2019Cryptosuite
} from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
import {cryptosuite as eddsaRdfc2022CryptoSuite} from
  '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';

export const cryptosuites = new Map([
  ['ecdsa-sd-2023', {
    cryptosuite: ecdsaSd2023Cryptosuite,
    multikey: EcdsaMultikey,
    serializedKeys: {
      'P-256': 'ecdsa/p256KeyPair.json',
    }
  }],
  ['bbs-2023', {
    cryptosuite: bbs2023Cryptosuite,
    multikey: Bls12381Multikey,
    serializedKeys: {
      'P-381': 'bbs/p381KeyPair.json',
    }
  }],
  ['ecdsa-rdfc-2019', {
    cryptosuite: ecdsaRdfc2019Cryptosuite,
    multikey: EcdsaMultikey,
    serializedKeys: {
      'P-256': 'ecdsa/p256KeyPair.json',
      'P-384': 'ecdsa/p384KeyPair.json'
    }
  }],
  ['eddsa-2022', {
    cryptosuite: eddsa2022CryptoSuite,
    multikey: Ed25519Multikey,
    serializedKeys: 'eddsa/p25519KeyPair.json'
  }],
  ['eddsa-rdfc-2022', {
    cryptosuite: eddsaRdfc2022CryptoSuite,
    multikey: Ed25519Multikey,
    serializedKeys: 'eddsa/p25519KeyPair.json'
  }]
]);

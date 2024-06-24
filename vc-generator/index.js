/*!
 * Copyright 2023 - 2024 Digital Bazaar, Inc. All Rights Reserved
 */
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
import {getDefaultKey} from './secret.js';
import {getGenerators} from './generators.js';
import {getSuites} from './cryptosuite.js';
import {issueCloned} from './issuer.js';
import {validVc} from '../index.js';

const _initCache = () => new Map([
  ['validVc', structuredClone(validVc)]
]);

// cache test data for a single run
const vcCache = new Map();

/**
 * Calls the vc generators and then returns a Map
 * with the test data.
 *
 * @param {object} options - Options to use.
 * @param {string} options.suiteName - A suite name.
 * @param {object} options.key - A key.
 * @param {object} options.cryptosuite - A cryptosuite for the test.
 * @param {Array<string>} options.mandatoryPointers - An array of JSON pointers.
 * @param {Array<string>} options.selectivePointers - An array of JSON pointers.
 * @param {boolean} options.verify - If a verify suite is needed.
 * @param {object} options.optionalTests - Options for running optional tests.
 * @param {object} [options.testVector = validVc] - A credential to use for
 *   test data.
 *
 * @returns {Promise<Map>} Returns a Map of test data.
 */
export async function generateTestData({
  suiteName = 'eddsa-2022',
  key,
  cryptosuite = eddsa2022CryptoSuite,
  mandatoryPointers,
  selectivePointers,
  verify,
  optionalTests,
  testVector = validVc
} = {}) {
  // if no key was supplied use the eddsa key
  if(!key) {
    key = await getDefaultKey();
  }
  if(!vcCache.get(suiteName)) {
    vcCache.set(suiteName, _initCache());
  }
  const credential = structuredClone(testVector);
  credential.issuer = key.controller;
  const signer = key.signer();
  const vcGenerators = getGenerators(optionalTests);
  for(const [id, generator] of vcGenerators) {
    const {suite, selectiveSuite} = getSuites({
      cryptosuite,
      signer,
      mandatoryPointers,
      selectivePointers,
      verify
    });
    const testData = await issueCloned(
      generator({suite, selectiveSuite, credential}));
    vcCache.get(suiteName).set(id, testData);
  }
  return {
    clone(key) {
      return structuredClone(vcCache.get(suiteName).get(key));
    }
  };
}

/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {getGenerators} from './generators.js';
import {getMultiKey} from './secret.js';
import {getSuites} from './cryptosuite.js';
import {klona} from 'klona';
import {validVc} from '../validVc.js';

const _initCache = () => new Map([
  ['validVc', klona(validVc)]
]);

// cache test data for a single run
const vcCache = new Map();

/**
 * Calls the vc generators and then returns a Map
 * with the test data.
 *
 * @param {object} options - Options to use.
 * @param {string} options.suiteName - A suite name.
 * @param {string} options.keyType - A keyType.
 * @param {Array<string>} options.mandatoryPointers - An array of JSON pointers.
 * @param {Array<string>} options.selectivePointers - An array of JSON pointers.
 * @param {boolean} options.verify - If a verify suite is needed.
 * @param {object} options.optionalTests - Options for running optional tests.
 *
 * @returns {Promise<Map>} Returns a Map of test data.
 */
export async function generateTestData({
  suiteName = 'eddsa-2022',
  keyType,
  mandatoryPointers,
  selectivePointers,
  verify,
  optionalTests
} = {}) {
  if(!vcCache.get(suiteName)) {
    vcCache.set(suiteName, _initCache());
  }
  const {signer, issuer} = await getMultiKey({
    keyType,
    suiteName
  });
  const credential = klona(validVc);
  credential.issuer = issuer;
  const vcGenerators = getGenerators(optionalTests);
  for(const [id, generator] of vcGenerators) {
    const {suite, selectiveSuite} = getSuites({
      suiteName,
      signer,
      mandatoryPointers,
      selectivePointers,
      verify
    });
    const testData = await generator({suite, selectiveSuite, credential});
    vcCache.get(suiteName).set(id, testData);
  }
  return {
    clone(key) {
      return klona(vcCache.get(suiteName).get(key));
    }
  };
}

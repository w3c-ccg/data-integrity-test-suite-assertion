/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {getMultikey} from './helpers.js';
import {getSuite} from './cryptosuite.js';
import {klona} from 'klona';
import {validVc} from '../validVc.js';
import {vcGenerators} from './generators.js';

// cache test data for a single run
const vcCache = new Map([
  ['validVc', klona(validVc)]
]);

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
 *
 * @returns {Promise<Map>} Returns a Map of test data.
 */
export async function generateTestData({
  suiteName = 'eddsa-2022',
  keyType,
  mandatoryPointers,
  selectivePointers,
  verify
} = {}) {
  const {signer, issuer} = await getMultikey({
    keyType,
    suite
  });
  const credential = klona(validVc);
  credential.issuer = issuer;
  for(const [id, generator] of vcGenerators) {
    if(vcCache.get(id)) {
      continue;
    }
    const suite = getSuite({
      suiteName,
      signer,
      keyType,
      mandatoryPointers,
      selectivePointers,
      verify
    });
    const testData = await generator({suite, credential});
    vcCache.set(id, testData);
  }
  return {
    clone(key) {
      return klona(vcCache.get(key));
    }
  };
}

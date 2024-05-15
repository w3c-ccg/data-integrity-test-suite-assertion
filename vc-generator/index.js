/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {getMultikey} from './helpers.js';
import {getSeed} from './secret.js';
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
 * @param {string} options.suite - A suite name.
 * @param {string} options.keyType - A keyType.
 *
 * @returns {Promise<Map>} Returns a Map of test data.
 */
export async function generateTestData({suite, keyType}) {
  const {signer, issuer} = await getMultikey({
    seedMultibase: getSeed({suite, keyType}),
    suite
  });
  const credential = klona(validVc);
  credential.issuer = issuer;
  for(const [id, generator] of vcGenerators) {
    if(vcCache.get(id)) {
      continue;
    }
    const testData = await generator({signer, credential});
    vcCache.set(id, testData);
  }
  return {
    clone(key) {
      return klona(vcCache.get(key));
    }
  };
}

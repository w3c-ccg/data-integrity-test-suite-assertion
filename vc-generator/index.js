/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {getMultikey} from './helpers.js';
import {klona} from 'klona';
import {TEST_KEY_SEED} from './secret.js';
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
 * @returns {Promise<Map>} Returns a Map of test data.
 */
export async function generateTestData() {
  const {signer, issuer} = await getMultikey({
    seedMultibase: TEST_KEY_SEED
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

/*!
 * Copyright 2023 - 2024 Digital Bazaar, Inc.
 */
import {cleanups, getGenerators, setups} from './generators.js';
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
import {getDefaultKey} from './secret.js';
import {getSuites} from './cryptosuite.js';
import {getVcVersion} from './contexts.js';
import {issueCloned} from './issuer.js';
import {staticFixtures} from './staticFixtures.js';
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
 * @param {Function} [options.documentLoader] - A documentLoader for test
 *   data generation.
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
  documentLoader,
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
    const getFixture = staticFixtures[id];
    if(getFixture) {
      const staticFixture = await getFixture({
        suiteName,
        version: getVcVersion(testVector)
      });
      // if there is a static fixture for this generator and suite use it
      if(staticFixture) {
        vcCache.get(suiteName).set(id, staticFixture);
        continue;
      }
    }
    // if a generator has a specific setup use it
    // otherwise getSuites is fine
    const setup = setups[id] || getSuites;
    const {suite, suites, selectiveSuite} = setup({
      cryptosuite,
      signer,
      mandatoryPointers,
      selectivePointers,
      verify
    });
    const issuedCredential = await issueCloned(generator({
      suite, suites, selectiveSuite,
      credential, loader: documentLoader
    }));
    const cleanup = cleanups[id];
    const testValue = cleanup ? cleanup({issuedCredential}) : issuedCredential;
    vcCache.get(suiteName).set(id, testValue);
  }
  return {
    clone(key) {
      return structuredClone(vcCache.get(suiteName).get(key));
    }
  };
}

/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {algorithmsSuite} from '../index.js';
import {createSuite} from './helpers.js';
import {cryptosuites} from './fixtures/cryptosuites.js';
import {documentLoader} from './fixtures/documentLoader.js';
import {MockIssuer} from './mock-data.js';
import {versionedCredentials} from './fixtures/credentials/index.js';

const tag = 'Test-Issuer-Valid';
const tags = [tag];

describe('should issue all suites', function() {
  for(const testDataOptions of cryptosuites) {
    for(const [
      vcVersion,
      {credential, mandatoryPointers}
    ] of versionedCredentials) {
      _runSuite({
        vcVersion,
        testDataOptions,
        credential,
        mandatoryPointers
      });
    }
  }
});

function _runSuite({
  vcVersion, testDataOptions,
  credential, mandatoryPointers
}) {
  const {suiteName, keyType = ''} = testDataOptions;
  let title = `VC ${vcVersion} Suite ${suiteName}`;
  if(keyType) {
    title += `keyType ${keyType}`;
  }
  return describe(title,
    function() {
      const implemented = new Map();
      const {cryptosuite, key, derived} = testDataOptions;
      const signer = key.signer();
      const suite = createSuite({
        signer, cryptosuite,
        mandatoryPointers, derived
      });
      // pass the VC's context to the issuer
      const {'@context': contexts} = credential;
      const issuer = new MockIssuer({
        tags, suite,
        contexts, documentLoader
      });
      implemented.set(suiteName, {endpoints: [issuer]});
      algorithmsSuite({
        endpoints: [issuer],
        tag,
        credential,
        cryptosuiteName: suiteName,
      });
    });
}

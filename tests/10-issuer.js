/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 */
import {checkDataIntegrityProofFormat} from '../index.js';
import {createSuite} from './helpers.js';
import {cryptosuites} from './fixtures/cryptosuites.js';
import {documentLoader} from './fixtures/documentLoader.js';
import {MockIssuer} from './mock-data.js';
import {versionedCredentials} from './fixtures/credentials/index.js';

const tag = 'Test-Issuer-Valid';
const tags = [tag];

describe('Test checkDataIntegrityProofFormat()', function() {
  it('should accept empty implemented.', function() {
    checkDataIntegrityProofFormat({
      implemented: new Map(),
      tag: 'Test-Issuer'
    });
  });
});

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
  return describe(`VC ${vcVersion} Suite ${suiteName} keyType ${keyType}`,
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
      checkDataIntegrityProofFormat({
        implemented,
        tag,
        credential,
        cryptosuiteName: suiteName,
      });
    });
}

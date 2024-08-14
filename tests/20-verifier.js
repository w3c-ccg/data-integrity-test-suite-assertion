/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc.
 */
import {checkDataIntegrityProofVerifyErrors} from '../index.js';
import {cryptosuites} from './fixtures/cryptosuites.js';
import {documentLoader} from './fixtures/documentLoader.js';
import {validVerifierImplementations} from './mock-data.js';
import {versionedCredentials} from './fixtures/credentials/index.js';

describe('Test checkDataIntegrityProofVerifyErrors()', function() {
  it('should accept empty implemented.', function() {
    checkDataIntegrityProofVerifyErrors({
      implemented: new Map(),
      tag: 'Test-Verifier'
    });
  });
  it('should pass if verifier implementation returns error.', function() {
    checkDataIntegrityProofVerifyErrors({
      implemented: validVerifierImplementations,
    });
  });
});

describe('should verify all suites', function() {
  for(const testDataOptions of cryptosuites) {
    for(const [vcVersion, credential] of versionedCredentials) {
      _runSuite({
        vcVersion,
        testDataOptions,
        credential
      });
    }
  }
});

function _runSuite({
  vcVersion, testDataOptions, credential
}) {
  const {suiteName, keyType} = testDataOptions;
  return describe(`VC ${vcVersion} Suite ${suiteName} keyType ${keyType}`,
    async function() {
      before(async function() {
        testDataOptions.testVector = structuredClone(credential);
      });
      checkDataIntegrityProofVerifyErrors({
        implemented: validVerifierImplementations,
        testDataOptions,
        optionalTests: testDataOptions.optionalTests
      });
    });
}

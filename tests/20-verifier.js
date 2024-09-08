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
    for(const [
      vcVersion,
      {credential, mandatoryPointers, selectivePointers}
    ] of versionedCredentials) {
      _runSuite({
        vcVersion,
        testDataOptions,
        credential,
        mandatoryPointers,
        selectivePointers
      });
    }
  }
});

function _runSuite({
  vcVersion, testDataOptions,
  credential, mandatoryPointers,
  selectivePointers
}) {
  const {suiteName, keyType, derived} = testDataOptions;
  let testTitle = `VC ${vcVersion} Suite ${suiteName}`;
  if(keyType) {
    testTitle += ` keyType ${keyType}`;
  }
  return describe(testTitle,
    async function() {
      before(async function() {
        testDataOptions.testVector = structuredClone(credential);
        testDataOptions.documentLoader = documentLoader;
        if(derived) {
          testDataOptions.mandatoryPointers = mandatoryPointers;
          testDataOptions.selectivePointers = selectivePointers;
        }
      });
      checkDataIntegrityProofVerifyErrors({
        implemented: validVerifierImplementations,
        testDataOptions,
        optionalTests: testDataOptions.optionalTests
      });
    });
}

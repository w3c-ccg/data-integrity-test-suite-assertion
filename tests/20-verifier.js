/*!
 * Copyright (c) 2023 Digital Bazaar, Inc.
 */
import {checkDataIntegrityProofVerifyErrors} from '../index.js';
import {cryptosuites} from './fixtures/constants.js';
import {getMultiKey} from './fixtures/keys/index.js';
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
  for(const [suiteName, _testDataOptions] of cryptosuites) {
    for(const [version, credential] of versionedCredentials) {
      describe(`VC ${version}`, function() {
        describe('should run verifier tests with suite ' +
          suiteName, async function() {
          const testDataOptions = structuredClone(_testDataOptions);
          before(async function() {
            testDataOptions.key = await getMultiKey({
              ...testDataOptions
            });
            testDataOptions.testVector = structuredClone(credential);
          });
          await checkDataIntegrityProofVerifyErrors({
            implemented: validVerifierImplementations,
            testDataOptions,
            optionalTests: testDataOptions.optionalTests
          });
        });
      });
    }
  }
});

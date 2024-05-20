/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import {mockTestOptions, validVerifierImplementations} from './mock-data.js';
import {checkDataIntegrityProofVerifyErrors} from '../index.js';

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
  for(const testDataOptions of mockTestOptions) {
    describe('should run verifier tests with suite ' +
      testDataOptions.suiteName, async function() {
      await checkDataIntegrityProofVerifyErrors({
        implemented: validVerifierImplementations,
        testDataOptions
      });
    });
  }
});

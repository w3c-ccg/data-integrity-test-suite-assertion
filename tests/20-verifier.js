/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import {
  allVerifierImplementations, validVerifierImplementations
} from './mock-data.js';
import {checkDataIntegrityProofVerifyErrors} from '../index.js';

describe('Test checkDataIntegrityProofVerifyErrors()', function() {
  it('should accept empty implemented and notImplemented.', function() {
    checkDataIntegrityProofVerifyErrors({
      implemented: new Map(),
      notImplemented: new Map(),
      tag: 'Test-Verifier'
    });
  });
  it('should pass if verifier implementation returns error.', function() {
    checkDataIntegrityProofVerifyErrors({
      implemented: validVerifierImplementations,
      notImplemented: new Map(),
      tag: 'Test-Issuer-Valid'
    });
  });
  it('should succeed if all notImplemented.', function() {
    checkDataIntegrityProofVerifyErrors({
      implemented: new Map(),
      notImplemented: allVerifierImplementations,
      tag: 'Test-Verifier'
    });
  });
});

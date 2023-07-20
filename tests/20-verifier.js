/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import {checkDataIntegrityProofVerifyErrors} from '../index.js';
import {validVerifierImplementations} from './mock-data.js';

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
      tag: 'Test-Issuer-Valid'
    });
  });
});

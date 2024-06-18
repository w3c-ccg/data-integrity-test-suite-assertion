/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {
  invalidIssuerImplementations, validIssuerImplementations
} from './mock-data.js';
import {checkDataIntegrityProofFormat} from '../index.js';

describe('Test checkDataIntegrityProofFormat()', function() {
  it('should accept empty implemented.', function() {
    checkDataIntegrityProofFormat({
      implemented: new Map(),
      tag: 'Test-Issuer'
    });
  });
  it('should pass if implemented returns a valid Vc.', function() {
    checkDataIntegrityProofFormat({
      implemented: validIssuerImplementations,
      tag: 'Test-Issuer-Valid',
      cryptosuiteName: 'eddsa-2022'
    });
  });
  // this results in the test suite reporting failure when it is
  // a successful negative test. FIXME: use sinon's mocks/stubs to assert
  // on some very specific permutation of chai's should interface to test this.
  it.skip('should fail if implemented returns an invalid Vc.', function() {
    checkDataIntegrityProofFormat({
      implemented: invalidIssuerImplementations,
      tag: 'Test-Issuer-Invalid'
    });
  });
});

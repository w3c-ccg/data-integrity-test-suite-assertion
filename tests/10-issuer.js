/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {
  allIssuerImplementations, invalidIssuerImplementations,
  validIssuerImplementations
} from './mock-data.js';
import {checkDataIntegrityProofFormat} from '../index.js';

describe('Test checkDataIntegrityProofFormat()', function() {
  it('should accept empty implemented and notImplemented.', function() {
    checkDataIntegrityProofFormat({
      implemented: new Map(),
      notImplemented: new Map(),
      tag: 'Test-Issuer'
    });
  });
  it('should pass if implemented returns a valid Vc.', function() {
    checkDataIntegrityProofFormat({
      implemented: validIssuerImplementations,
      notImplemented: new Map(),
      tag: 'Test-Issuer-Valid'
    });
  });
  // this results in the test suite reporting failure when it is
  // a successful negative test. FIXME: use sinon's mocks/stubs to assert
  // on some very specific permutation of chai's should interface to test this.
  it.skip('should fail if implemented returns an invalid Vc.', function() {
    checkDataIntegrityProofFormat({
      implemented: invalidIssuerImplementations,
      notImplemented: validIssuerImplementations,
      tag: 'Test-Issuer-Invalid'
    });
  });
  it('should succeed if all notImplemented.', function() {
    checkDataIntegrityProofFormat({
      implemented: new Map(),
      notImplemented: allIssuerImplementations,
      tag: 'Test-Issuer'
    });
  });
});

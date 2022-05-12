/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {checkDataIntegrityProofFormat} = require('..');
const {
  allImplementations,
  validImplementations,
  invalidImplementations
} = require('./mock-data');

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
      implemented: validImplementations,
      notImplemented: invalidImplementations,
      tag: 'Test-Issuer-Valid'
    });
  });
  it('should fail if implemented returns an invalid Vc.', function() {
    checkDataIntegrityProofFormat({
      implemented: invalidImplementations,
      notImplemented: validImplementations,
      tag: 'Test-Issuer-Invalid'
    });
  });
  it('should succeed if all notImplemented.', function() {
    checkDataIntegrityProofFormat({
      implemented: new Map(),
      notImplemented: allImplementations,
      tag: 'Test-Issuer'
    });
  });
});

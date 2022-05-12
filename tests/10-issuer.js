/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {checkDataIntegrityProofFormat} = require('..');
const {mockImplementations} = require('./mock-data');

describe('Test checkDataIntegrityProofFormat()', function() {
  it('should accept empty implemented and notImplemented.',
    function() {
      checkDataIntegrityProofFormat({
          implemented: new Map(),
          notImplemented: new Map(),
          tag: 'Test-Issuer'
      });
    });
  it('should pass if implemented returns a valid Vc.',
    async function() {
      checkDataIntegrityProofFormat({
        implemented: mockImplementations,
        notImplemented: new Map(),
        tag: 'Test-Issuer-Valid'
      });
    });
  it.skip('should fail if implemented returns an invalid Vc.',
    function() {
      checkDataIntegrityProofFormat({
        implemented: mockImplementations,
        notImplemented: new Map(),
        tag: 'Test-Issuer-Invalid'
      });
    });
  it('should succeed if all notImplemented.',
    function() {
      checkDataIntegrityProofFormat({
        implemented: new Map(),
        notImplemented: mockImplementations,
        tag: 'Test-Issuer'
      });
    });
});

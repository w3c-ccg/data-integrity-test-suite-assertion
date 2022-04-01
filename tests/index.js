/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {checkDataIntegrityProofFormat} = require('..');
const validData = require('./valid-mock-data.json');

describe('Test checkDataIntegrityProofFormat()', function() {
  it('should pass if all the required properties exist and are of valid type.',
    function() {
      checkDataIntegrityProofFormat({data: validData});
    });
});

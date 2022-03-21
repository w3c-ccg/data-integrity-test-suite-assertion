/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {checkDataIntegrity} = require('..');
const validData = require('./valid-mock-data.json');

describe('Test checkDataIntegrity()', function() {
  it('should pass if all the required properties exist and are of valid type.',
    function() {
      checkDataIntegrity(validData);
    });
});

/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {checkDataIntergrity} = require('..');
const validData = require('./valid-mock-data.json');

describe('Test checkDataIntergrity()', function() {
  it('should pass if all the required properties exist and are of valid type.',
    async () => {
      checkDataIntergrity(validData);
    });
});

/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const validVc = require('./valid-mock-data.json');
const {klona} = require('klona');

class MockIssuer {
  constructor({tags, mockVc}) {
    this._tags = tags;
    this._mockVc = mockVc;
  }
  get tags() {
    return new Set(this._tags);
  }
  async issue() {
    return {data: this._mockVc};
  }
}

const validIssuer = new MockIssuer({
  tags: ['Test-Issuer', 'Test-Issuer-Valid'],
  mockVc: klona(validVc)
});

const invalidVc = klona(validVc);
delete invalidVc.proof;

const invalidIssuer = new MockIssuer({
  tags: ['Test-Issuer', 'Test-Issuer-Invalid'],
  mockVc: invalidVc
});

class MockImplementation {
  get issuers() {
    return [
      validIssuer,
      invalidIssuer
    ];
  }
  get verifiers() {
    return [];
  }
  // skipping didResolvers as unneeded here
}

const mockImplementations = new Map([
  ['mockImplementation', new MockImplementation()]
]);

module.exports = {
  mockImplementations
};

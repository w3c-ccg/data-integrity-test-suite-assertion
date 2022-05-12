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
  constructor({issuers = []}) {
    this._issuers = issuers;
  }
  get issuers() {
    return this._issuers;
  }
  get verifiers() {
    return [];
  }
  // skipping didResolvers as unneeded here
}

const validImplementations = new Map([
  ['validImplementation', new MockImplementation({issuers: [validIssuer]})]
]);

const invalidImplementations = new Map([
  ['invalidImplementation', new MockImplementation({issuers: [invalidIssuer]})]
]);

const allImplementations = new Map([
  ['validImplementation', new MockImplementation({issuers: [validIssuer]})],
  ['invalidImplementation', new MockImplementation({issuers: [invalidIssuer]})]
]);

module.exports = {
  validImplementations,
  invalidImplementations,
  allImplementations
};

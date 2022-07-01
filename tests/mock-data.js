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
    this.settings = {
      id: 'did:issuer:foo',
      options: {

      }
    };
  }
  get tags() {
    return new Set(this._tags);
  }
  async post() {
    return {data: this._mockVc};
  }
}

const validIssuer = new MockIssuer({
  tags: ['Test-Issuer', 'Test-Issuer-Valid'],
  mockVc: klona(validVc)
});

const invalidVc = klona(validVc);
invalidVc.proof.type = {
  proofType: 'not-data-integrity'
};
invalidVc.proof.created = Date.now().toString();
invalidVc.proof.verificationMethod = 'not-a-url';
invalidVc.proof.proofPurpose = {
  purpose: 'not-data-integrity'
};
invalidVc.proof.proofValue = 12390;

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

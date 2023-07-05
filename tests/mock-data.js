/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {issuedVc} from '../issuedVc.js';
import {klona} from 'klona';

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
  mockVc: klona(issuedVc)
});

const invalidVc = klona(issuedVc);
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

export const validImplementations = new Map([
  ['validImplementation', {endpoints: [validIssuer]}]
]);

export const invalidImplementations = new Map([
  ['invalidImplementation', {endpoints: [invalidIssuer]}]
]);

export const allImplementations = new Map([
  ['validImplementation', {endpoints: [validIssuer]}],
  ['invalidImplementation', {endpoints: [invalidIssuer]}]
]);

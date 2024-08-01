/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 */
import * as vc from '@digitalbazaar/vc';
import {createRequire} from 'node:module';
// FIXME remove this once node has non-experimental support
// for importing json via import
// @see https://nodejs.org/api/esm.html#json-modules
const require = createRequire(import.meta.url);
const issuedVc = require('./fixtures/issuedVc.json');

class MockIssuer {
  constructor({tags, suite, documentLoader}) {
    this._tags = tags;
    this.settings = {
      id: 'did:example:issuer',
      options: {}
    };
    this.suite = suite;
    this.documentLoader = documentLoader;
  }
  get tags() {
    return new Set(this._tags);
  }
  async post({json}) {
    let data;
    let error;
    try {
      const {credential} = json;
      data = await vc.issue({
        credential,
        documentLoader: this.documentLoader,
        suite: this.suite,
      });
    } catch(e) {
      error = e;
    } finally {
      return {data, error};
    }
  }
}

class MockVerifier {
  constructor({tags}) {
    this._tags = tags;
    this.settings = {
      id: 'did:verifier:foo',
      options: {

      }
    };
  }
  get tags() {
    return new Set(this._tags);
  }
  async post() {
    // verifier must return error for all the tests to pass.
    const error = new Error('vc is invalid');
    error.status = 400;
    return {error};
  }
}

const validIssuer = new MockIssuer({
  tags: ['Test-Issuer', 'Test-Issuer-Valid'],
  mockVc: structuredClone(issuedVc)
});

const validVerifier = new MockVerifier({
  tags: ['Test-Verifier', 'Test-Verifier-Valid'],
});

const invalidVc = structuredClone(issuedVc);
invalidVc.proof.type = {
  proofType: 'not-data-integrity'
};
invalidVc.proof.created = Date.now().toString();
invalidVc.proof.verificationMethod = ['not-a-url'];
invalidVc.proof.proofPurpose = {
  purpose: 'not-data-integrity'
};
invalidVc.proof.proofValue = 12390;

const invalidIssuer = new MockIssuer({
  tags: ['Test-Issuer', 'Test-Issuer-Invalid'],
  mockVc: invalidVc
});

export const validIssuerImplementations = new Map([
  ['validIssuerImplementation', {endpoints: [validIssuer]}],
]);

export const validVerifierImplementations = new Map([
  ['validVerifierImplementation', {endpoints: [validVerifier]}],
]);

export const invalidIssuerImplementations = new Map([
  ['invalidIssuerImplementation', {endpoints: [invalidIssuer]}]
]);

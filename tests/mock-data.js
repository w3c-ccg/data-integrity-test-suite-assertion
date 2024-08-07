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

export class MockIssuer {
  constructor({
    tags,
    suite,
    documentLoader,
    contexts = ['https://www.w3.org/2018/credentials/v1']
  }) {
    this._tags = tags;
    this.settings = {
      id: 'did:example:issuer',
      options: {}
    };
    this.suite = suite;
    this.documentLoader = documentLoader;
    this.contexts = contexts;
  }
  get tags() {
    return new Set(this._tags);
  }
  async post({json}) {
    let data;
    let error;
    let statusCode = 201;
    try {
      const {credential} = json;
      if(!('@context' in credential)) {
        credential['@context'] = [...this.contexts];
      }
      data = await vc.issue({
        credential,
        documentLoader: this.documentLoader,
        suite: this.suite,
      });
    } catch(e) {
      error = e;
    } finally {
      if(error) {
        error.status = 400;
        statusCode = 400;
        return {data, error, statusCode};
      }
      const result = {data, status: statusCode};
      return {data, result, statusCode};
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

export const validVerifierImplementations = new Map([
  ['validVerifierImplementation', {endpoints: [validVerifier]}],
]);

/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 */
import * as vc from '@digitalbazaar/vc';
import {createRequire} from 'node:module';
import {verifierSuites} from './fixtures/cryptosuites.js';

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
  constructor({tags, documentLoader}) {
    this.documentLoader = documentLoader;
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
  async post({json}) {
    const {verifiableCredential, options} = json;
    const result = await vc.verifyCredential({
      credential: verifiableCredential,
      suite: verifierSuites,
      documentLoader: this.documentLoader,
      ...options
    });
    if(result.verified) {
      return {data: {...result}, result: {status: 201}, statusCode: 201};
    }
    return {data: {...result}, error: {status: 400}, statusCode: 400};
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

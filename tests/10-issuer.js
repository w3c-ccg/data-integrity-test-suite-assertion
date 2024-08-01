/*!
 * Copyright (c) 2022 Digital Bazaar, Inc.
 */
import {checkDataIntegrityProofFormat} from '../index.js';
import {cryptosuites} from './fixtures/constants.js';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from '../vc-generator/documentLoader.js';
import {getMultiKey} from './fixtures/keys/index.js';
import {MockIssuer} from './mock-data.js';

const tag = 'Test-Issuer-Valid';
const tags = [tag];

describe('Test checkDataIntegrityProofFormat()', function() {
  it('should accept empty implemented.', function() {
    checkDataIntegrityProofFormat({
      implemented: new Map(),
      tag: 'Test-Issuer'
    });
  });
  for(const [suiteName, testDataOptions] of cryptosuites) {
    describe('should run issuer tests with suite ', async function() {
      const implemented = new Map();
      before(async function() {
        const key = await getMultiKey({
          ...testDataOptions
        });
        const signer = key.signer();
        const suite = new DataIntegrityProof({
          signer,
          cryptosuite: testDataOptions.cryptosuite
        });
        const issuer = new MockIssuer({tags, suite, documentLoader});
        implemented.set(suiteName, {endpoints: [issuer]});
      });
      it(suiteName, function() {
        checkDataIntegrityProofFormat({
          implemented,
          tag,
          cryptosuiteName: suiteName
        });
      });
    });
  }
});

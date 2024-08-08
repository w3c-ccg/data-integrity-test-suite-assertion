/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 */
import {checkDataIntegrityProofFormat} from '../index.js';
import {createSuite} from './helpers.js';
import {cryptosuites} from './fixtures/constants.js';
import {documentLoader} from '../vc-generator/documentLoader.js';
import {getMultiKey} from './fixtures/keys/index.js';
import {MockIssuer} from './mock-data.js';
import {versionedCredentials} from './fixtures/credentials/index.js';

const tag = 'Test-Issuer-Valid';
const tags = [tag];

describe('Test checkDataIntegrityProofFormat()', function() {
  it('should accept empty implemented.', function() {
    checkDataIntegrityProofFormat({
      implemented: new Map(),
      tag: 'Test-Issuer'
    });
  });
});

describe('should issue all suites', function() {
  for(const [suiteName, testDataOptions] of cryptosuites) {
    for(const [vcVersion, credential] of versionedCredentials) {
      _runSuite({
        suiteName,
        vcVersion,
        testDataOptions,
        credential
      });
    }
  }
});

function _runSuite({suiteName, vcVersion, testDataOptions, credential}) {
  return describe(`VC ${vcVersion} Suite ${suiteName}`, async function() {
    const implemented = new Map();
    before(async function() {
      try {
        const key = await getMultiKey({
          ...testDataOptions
        });
        const {mandatoryPointers, cryptosuite} = testDataOptions;
        const signer = key.signer();
        const suite = createSuite({signer, cryptosuite, mandatoryPointers});
        // pass the VC's context to the issuer
        const {'@context': contexts} = credential;
        const issuer = new MockIssuer({tags, suite, contexts, documentLoader});
        implemented.set(suiteName, {endpoints: [issuer]});
      } catch(e) {
        console.error(e);
      }
    });
    checkDataIntegrityProofFormat({
      implemented,
      tag,
      credential,
      cryptosuiteName: suiteName
    });
  });
}

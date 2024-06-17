/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {generateTestData} from '../vc-generator/index.js';
import {verificationFail} from '../helpers.js';

export function runDataIntegrityProofVerifyTests({
  endpoints,
  expectedProofType,
  testDescription,
  vendorName,
  testDataOptions,
  optionalTests
}) {
  return describe(testDescription, function() {
    const [verifier] = endpoints;
    if(!verifier) {
      throw new Error(`Expected ${vendorName} to have a verifier.`);
    }
    beforeEach(function() {
      this.currentTest.cell = {
        columnId: testDescription,
        rowId: this.currentTest.title
      };
    });
    let credentials;
    before(async function() {
      credentials = await generateTestData({...testDataOptions, optionalTests});
    });
    it('If the "proof" field is missing, an error MUST be raised.',
      async function() {
        const credential = credentials.clone('issuedVc');
        delete credential.proof;
        await verificationFail({credential, verifier});
      });
    it('If the "proof" field is invalid, an error MUST be raised.',
      async function() {
        const credential = credentials.clone('issuedVc');
        credential.proof = null;
        await verificationFail({credential, verifier});
      });
    it('If the "proof.type" field is missing, an error MUST be raised.',
      async function() {
        const credential = credentials.clone('issuedVc');
        delete credential.proof.type;
        await verificationFail({credential, verifier});
      });
    it(`If the "proof.type" field is not the string ` +
      `"${expectedProofType}", an error MUST be raised.`,
    async function() {
      const credential = credentials.clone('invalidProofType');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.verificationMethod" field is missing, an error ' +
      'MUST be raised.', async function() {
      const credential = credentials.clone('noVm');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.verificationMethod" field is invalid, an error ' +
      'MUST be raised.', async function() {
      const credential = credentials.clone('invalidVm');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofPurpose" field is missing, an error MUST ' +
      'be raised.', async function() {
      const credential = credentials.clone('noProofPurpose');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofPurpose" field is invalid, an error MUST ' +
      'be raised.', async function() {
      const credential = credentials.clone('invalidProofPurpose');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofPurpose" value does not match ' +
      '"options.expectedProofPurpose", an error MUST be raised.',
    async function() {
      const credential = credentials.clone('issuedVc');
      await verificationFail({
        credential, verifier, options: {
          // this will fail since the vc generated is created with the
          // assertionMethod proof purpose.
          expectedProofPurpose: 'authentication'
        }
      });
    });
    it('If the "proof.proofValue" field is missing, an error MUST ' +
      'be raised.', async function() {
      // proofValue is added after signing so we can
      // safely delete it for this test
      const credential = credentials.clone('issuedVc');
      delete credential.proof.proofValue;
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofValue" field is invalid, an error MUST be ' +
      'raised.', async function() {
      // null should be an invalid proofValue for almost any proof
      const credential = credentials.clone('issuedVc');
      credential.proof.proofValue = null;
      await verificationFail({credential, verifier});
    });
    if(optionalTests?.created) {
      it('If the "proof.created" field is invalid, an error MUST be ' +
        'raised.', async function() {
        const credential = credentials.clone('invalidCreated');
        await verificationFail({credential, verifier});
      });
    }
    it('If the "proof.proofValue" field is not multibase-encoded, an error ' +
      'MUST be raised.', async function() {
      const credential = credentials.clone('issuedVc');
      // Remove the multibase header to cause validation error
      credential.proof.proofValue = credential.proof.proofValue.slice(1);
      await verificationFail({credential, verifier});
    });
    if(optionalTests.authentication) {
      it('If the "options.domain" is set and it does not match ' +
        '"proof.domain", an error MUST be raised.',
      async function() {
        const credential = credentials.clone('invalidDomain');
        await verificationFail({
          credential, verifier, options: {
            domain: 'domain.example'
          }
        });
      });
      it('If the "options.challenge" is set and it does not match ' +
        '"proof.challenge", an error MUST be raised.', async function() {
        const credential = credentials.clone('invalidChallenge');
        await verificationFail({
          credential, verifier, options: {
            domain: 'domain.example',
            challenge: '1235abcd6789'
          }
        });
      });
    }
  });
}

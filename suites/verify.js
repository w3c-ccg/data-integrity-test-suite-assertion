/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {generateTestData} from '../vc-generator/index.js';
import {verificationFail} from '../assertions.js';

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
      it('The date and time the proof was created is OPTIONAL and, if ' +
      'included, MUST be specified as an [XMLSCHEMA11-2] dateTimeStamp ' +
      'string, either in Universal Coordinated Time (UTC), denoted by a Z ' +
      'at the end of the value, or with a time zone offset relative ' +
      'to UTC.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=MUST%20be%20specified%20as%20an%20%5BXMLSCHEMA11%2D2%5D%20dateTimeStamp%20string%2C%20either%20in%20Universal%20Coordinated%20Time%20(UTC)%2C%20denoted%20by%20a%20Z%20at%20the%20end%20of%20the%20value%2C%20or%20with%20a%20time%20zone%20offset%20relative%20to%20UTC';
        const credential = credentials.clone('invalidCreated');
        await verificationFail({credential, verifier});
      });
      // we can't tell if its interpreted correctly but we can ensure their
      // verifier at least takes timestamps without Z or an offset.
      it('(created) Time values that are incorrectly serialized without an ' +
      'offset MUST be interpreted as UTC.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=relative%20to%20UTC.-,Time%20values%20that%20are%20incorrectly%20serialized%20without%20an%20offset%20MUST%20be%20interpreted%20as%20UTC.,-expires';
        const credential = credentials.clone('noOffsetCreated');
        await verificationFail({credential, verifier});
      });
      it('(expires) Time values that are incorrectly serialized without an ' +
      'offset MUST be interpreted as UTC.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=relative%20to%20UTC.-,Time%20values%20that%20are%20incorrectly%20serialized%20without%20an%20offset%20MUST%20be%20interpreted%20as%20UTC.,-domain';
        await verificationFail({
          credential: credentials.clone('noOffsetExpires'),
          verifier
        });
      });
    }
    it('If the "proof.proofValue" field is not multibase-encoded, an error ' +
      'MUST be raised.', async function() {
      const credential = credentials.clone('issuedVc');
      // Remove the multibase header to cause validation error
      credential.proof.proofValue = credential.proof.proofValue.slice(1);
      await verificationFail({credential, verifier});
    });
    it('The value of the cryptosuite property MUST be a string that ' +
    'identifies the cryptographic suite. If the processing environment ' +
    'supports subtypes of string, the type of the cryptosuite value MUST ' +
    'be the https://w3id.org/security#cryptosuiteString subtype of string.',
    async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#introduction:~:text=The%20value%20of%20the%20cryptosuite%20property%20MUST%20be%20a%20string%20that%20identifies%20the%20cryptographic%20suite.%20If%20the%20processing%20environment%20supports%20subtypes%20of%20string%2C%20the%20type%20of%20the%20cryptosuite%20value%20MUST%20be%20the%20https%3A//w3id.org/security%23cryptosuiteString%20subtype%20of%20string.';
      const credential = credentials.clone('invalidCryptosuite');
      await verificationFail({credential, verifier});
    });
    if(optionalTests.authentication) {
      it('If domain was given, and it does not contain the same strings as ' +
         'proof.domain (treating a single string as a set containing just ' +
         'that string), an error MUST be raised and SHOULD convey an error ' +
          'type of INVALID_DOMAIN_ERROR.',
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

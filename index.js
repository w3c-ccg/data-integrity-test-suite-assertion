/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {
  checkKeyType, createInitialVc, dateRegex, isObjectOrArrayOfObjects,
  isStringOrArrayOfStrings, shouldBeBase64NoPadUrl,
  shouldBeBs58, verificationFail
} from './helpers.js';
import chai from 'chai';
import {generateTestData} from './vc-generator/index.js';
import {validVc} from './validVc.js';

const should = chai.should();

/**
 * Validates the structure of the "proof" property on a digital document.
 *
 * @param {object} options - Options to use.
 * @param {Map<string,object>} options.implemented - The vendors being tested.
 * @param {Array<string>} [options.expectedProofTypes] - An option to specify
 *   the expected proof types. The default value is set to
 *   ['DataIntegrityProof'].
 * @param {boolean} [options.expectedCryptoSuite] - A boolean option to specify
 *   if "cryptosuite" field is expected in the proof or not. The default value
 *   is set to true.
 * @param {boolean} [options.isEcdsaTests] - A boolean option to specify
 *   if it is used in ecdsa test suite or not. The default value
 *   is set to false.
 * @param {string} [options.testDescription] - An option to define
 *   the test description. The default value is set to
 *   `Data Integrity (issuer)`.
 *
 * @returns {object} Returns the test suite being run.
 */
export function checkDataIntegrityProofFormat({
  implemented, expectedProofTypes = ['DataIntegrityProof'],
  expectedCryptoSuite = true, isEcdsaTests = false,
  testDescription = 'Data Integrity (issuer)'
} = {}) {
  return describe(testDescription, function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Issuer';
    this.implemented = [];
    for(const [vendorName, {endpoints}] of implemented) {
      if(!endpoints) {
        throw new Error(`Expected ${vendorName} to have endpoints.`);
      }
      for(const endpoint of endpoints) {
        if(isEcdsaTests) {
          const {supportedEcdsaKeyTypes} = endpoint.settings;
          for(const supportedEcdsaKeyType of supportedEcdsaKeyTypes) {
            const keyType = checkKeyType(supportedEcdsaKeyType);
            this.implemented.push(`${vendorName}: ${keyType}`);
            runDataIntegrityProofFormatTests({
              endpoints, expectedCryptoSuite, expectedProofTypes,
              testDescription: `${vendorName}: ${keyType}`, vendorName
            });
          }
        } else {
          this.implemented.push(vendorName);
          runDataIntegrityProofFormatTests({
            endpoints, expectedCryptoSuite, expectedProofTypes,
            testDescription: vendorName, vendorName
          });
        }
      }
    } // end for loop
  }); // end describe
}

function runDataIntegrityProofFormatTests({
  endpoints, expectedCryptoSuite, expectedProofTypes, testDescription,
  vendorName
}) {
  describe(testDescription, function() {
    const columnId = testDescription;
    let proofs = [];
    let data;
    before(async function() {
      const [issuer] = endpoints;
      if(!issuer) {
        throw new Error(`Expected ${vendorName} to have an issuer.`);
      }
      data = await createInitialVc({issuer, vc: validVc});
      proofs = Array.isArray(data.proof) ? data.proof : [data.proof];
    });
    it('"proof" field MUST exist and MUST be either a single object or ' +
      'an unordered set of objects.', function() {
      this.test.cell = {columnId, rowId: this.test.title};
      should.exist(data, 'Expected data.');
      const proof = data.proof;
      should.exist(proof, 'Expected proof to exist.');
      const validType = isObjectOrArrayOfObjects(proof);
      validType.should.equal(true, 'Expected proof to be' +
        'either an object or an unordered set of objects.');
    });
    it('if "proof.id" field exists, it MUST be a valid URL.', function() {
      this.test.cell = {columnId, rowId: this.test.title};
      for(const proof of proofs) {
        if(proof.id) {
          let result;
          let err;
          try {
            result = new URL(proof.id);
          } catch(e) {
            err = e;
          }
          should.not.exist(err, 'Expected URL check of the "proof.id" ' +
            'to not error.');
          should.exist(result, 'Expected "proof.id" to be a URL.');
        }
      }
    });
    it('"proof.type" field MUST exist and be a string.', function() {
      this.test.cell = {columnId, rowId: this.test.title};
      for(const proof of proofs) {
        proof.should.have.property('type');
        proof.type.should.be.a(
          'string', 'Expected "proof.type" to be a string.');
      }
    });
    it(`"proof.type" field MUST be "${expectedProofTypes.join(',')}" ` +
      `and the associated document MUST include expected contexts.`,
    function() {
      this.test.cell = {columnId, rowId: this.test.title};
      for(const proof of proofs) {
        proof.should.have.property('type');
        proof.type.should.be.a(
          'string',
          'Expected "proof.type" to be a string.'
        );
        const hasExpectedType = expectedProofTypes.includes(proof.type);
        hasExpectedType.should.equal(true);

        if(proof.type === 'DataIntegrityProof') {
          const expectedContexts = [
            'https://www.w3.org/ns/credentials/v2',
            'https://w3id.org/security/data-integrity/v2'
          ];
          const hasExpectedContexts = expectedContexts.some(
            value => data['@context'].includes(value));
          hasExpectedContexts.should.equal(true);
        }

        if(proof.type === 'Ed25519Signature2020') {
          const expectedContext =
            'https://w3id.org/security/suites/ed25519-2020/v1';
          const hasExpectedContext =
            data['@context'].includes(expectedContext);
          hasExpectedContext.should.equal(true);
        }
      }
    });
    if(expectedCryptoSuite) {
      it('"proof.cryptosuite" field MUST exist and be a string.',
        function() {
          this.test.cell = {columnId, rowId: this.test.title};
          for(const proof of proofs) {
            proof.should.have.property('cryptosuite');
            proof.cryptosuite.should.be.a('string', 'Expected ' +
              '"cryptosuite" property to be a string.');
          }
        });
    }
    it('if "proof.created" field exists, it MUST be a valid ' +
      'XMLSCHEMA-11 dateTimeStamp value.', function() {
      this.test.cell = {columnId, rowId: this.test.title};
      for(const proof of proofs) {
        if(proof.created) {
          // check if "created" is a valid XML Schema 1.1 dateTimeStamp
          // value
          proof.created.should.match(dateRegex);
        }
      }
    });
    it('if "proof.expires" field exists, it MUST be a valid ' +
      'XMLSCHEMA-11 dateTimeStamp value.', function() {
      this.test.cell = {columnId, rowId: this.test.title};
      for(const proof of proofs) {
        if(proof.expires) {
          // check if "created" is a valid XML Schema 1.1 dateTimeStamp
          // value
          proof.expires.should.match(dateRegex);
        }
      }
    });
    it('"proof.verificationMethod" field MUST exist and be a valid URL.',
      function() {
        this.test.cell = {columnId, rowId: this.test.title};
        for(const proof of proofs) {
          proof.should.have.property('verificationMethod');
          let result;
          let err;
          try {
            result = new URL(proof.verificationMethod);
          } catch(e) {
            err = e;
          }
          should.not.exist(err, 'Expected URL check of the ' +
            '"verificationMethod" to not error.');
          should.exist(result, 'Expected "verificationMethod" ' +
            'to be a URL');
        }
      });
    it('"proof.proofPurpose" field MUST exist and be a string.',
      function() {
        this.test.cell = {columnId, rowId: this.test.title};
        for(const proof of proofs) {
          proof.should.have.property('proofPurpose');
          proof.proofPurpose.should.be.a('string');
        }
      });
    it('"proof.proofValue" field MUST exist and be a string.',
      function() {
        this.test.cell = {columnId, rowId: this.test.title};
        for(const proof of proofs) {
          proof.should.have.property('proofValue');
          proof.proofValue.should.be.a('string');
        }
      });
    it('"proof.proofValue" MUST be a valid multibase-encoded value.',
      function() {
        this.test.cell = {columnId, rowId: this.test.title};

        const b64Suites = ['ecdsa-sd-2023', 'bbs-2023'];

        const expectedPrefix = cryptosuite =>
          b64Suites.includes(cryptosuite) ? 'u' : 'z';
        const isExpectedEncoding = ({cryptosuite, proofValue}) =>
          b64Suites.includes(cryptosuite) ?
            shouldBeBase64NoPadUrl(proofValue) : shouldBeBs58(proofValue);

        for(const proof of proofs) {
          proof.proofValue.slice(0, 1)
            .should.equal(
              expectedPrefix(proof.cryptosuite),
              b64Suites.includes(proof.cryptosuite) ?
                'Expected "proof.proofValue" to be a base64url value' :
                'Expected "proof.proofValue" to be a base58btc value'
            );

          isExpectedEncoding(proof).should.equal(true,
            'Expected "proof.proofValue" to be correctly encoded'
          );
        }
      });
    it('if "proof.domain" field exists, it MUST be either a string, ' +
      'or an unordered set of strings.', function() {
      this.test.cell = {columnId, rowId: this.test.title};
      for(const proof of proofs) {
        if(proof.domain) {
          const validType = isStringOrArrayOfStrings(proof.domain);
          validType.should.equal(true, 'Expected ' +
            '"proof.domain" to be either a string or an unordered ' +
            'set of strings.');
        }
      }
    });
    it('if "proof.challenge" field exists, it MUST be a string.',
      function() {
        this.test.cell = {columnId, rowId: this.test.title};
        for(const proof of proofs) {
          if(proof.challenge) {
            // domain must be specified
            should.exist(proof.domain, 'Expected "proof.domain" ' +
              'to be specified.');
            proof.challenge.should.be.a('string', 'Expected ' +
              '"proof.challenge" to be a string.');
          }
        }
      });
    it('if "proof.previousProof" field exists, it MUST be a string.',
      function() {
        this.test.cell = {columnId, rowId: this.test.title};
        for(const proof of proofs) {
          if(proof.previousProof) {
            proof.previousProof.should.be.a('string', 'Expected ' +
              '"proof.previousProof" to be a string.');
          }
        }
      });
    it('if "proof.nonce" field exists, it MUST be a string.',
      function() {
        this.test.cell = {columnId, rowId: this.test.title};
        for(const proof of proofs) {
          if(proof.nonce) {
            proof.nonce.should.be.a('string', 'Expected "proof.nonce" ' +
              'to be a string.');
          }
        }
      });
  });
}

/**
 * Verifies a proof on Verifiable Credential.
 *
 * @param {object} options - Options to use.
 * @param {Map<string,object>} options.implemented - The vendors being tested.
 * @param {string} [options.expectedProofType] - An option to specify
 *   the expected proof type that is used to generate test titles.
 *   The default value is set to 'DataIntegrityProof'.
 * @param {boolean} [options.isEcdsaTests] - A boolean option to specify
 *   if it is used in ecdsa test suite or not. The default value
 *   is set to false.
 * @param {string} [options.testDescription] - An option to define
 *   the test description. The default value is set to
 *   `Data Integrity (verifier)`.
 *
 * @returns {object} Returns the test suite being run.
 */
export function checkDataIntegrityProofVerifyErrors({
  implemented, expectedProofType = 'DataIntegrityProof',
  isEcdsaTests = false, testDescription = 'Data Integrity (verifier)'
} = {}) {
  return describe(testDescription, function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [];
    for(const [vendorName, {endpoints}] of implemented) {
      if(!endpoints) {
        throw new Error(`Expected ${vendorName} to have endpoints.`);
      }
      for(const endpoint of endpoints) {
        let name;
        if(isEcdsaTests) {
          const {supportedEcdsaKeyTypes} = endpoint.settings;
          const keyTypes = supportedEcdsaKeyTypes.join(', ');
          name = `${vendorName}: ${keyTypes}`;
        } else {
          name = vendorName;
        }
        this.implemented.push(name);
        runDataIntegrityProofVerifyTests({
          endpoints, expectedProofType, testDescription: name, vendorName
        });
      }
    } // end for loop
  }); // end describe
}

function runDataIntegrityProofVerifyTests({
  endpoints, expectedProofType, testDescription, vendorName,
}) {
  const columnId = testDescription;
  describe(testDescription, function() {
    const [verifier] = endpoints;
    if(!verifier) {
      throw new Error(`Expected ${vendorName} to have a verifier.`);
    }
    let credentials;
    before(async function() {
      credentials = await generateTestData();
    });
    it('If the "proof" field is missing, an error MUST be raised.',
      async function() {
        this.test.cell = {columnId, rowId: this.test.title};
        const credential = credentials.clone('issuedVc');
        delete credential.proof;
        await verificationFail({credential, verifier});
      });
    it('If the "proof" field is invalid, an error MUST be raised.',
      async function() {
        this.test.cell = {columnId, rowId: this.test.title};
        const credential = credentials.clone('issuedVc');
        credential.proof = null;
        await verificationFail({credential, verifier});
      });
    it('If the "proof.type" field is missing, an error MUST be raised.',
      async function() {
        this.test.cell = {columnId, rowId: this.test.title};
        const credential = credentials.clone('issuedVc');
        delete credential.proof.type;
        await verificationFail({credential, verifier});
      });
    it(`If the "proof.type" field is not the string ` +
      `"${expectedProofType}", an error MUST be raised.`,
    async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      const credential = credentials.clone('invalidProofType');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.verificationMethod" field is missing, an error ' +
      'MUST be raised.', async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      const credential = credentials.clone('noVm');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.verificationMethod" field is invalid, an error ' +
      'MUST be raised.', async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      const credential = credentials.clone('invalidVm');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofPurpose" field is missing, an error MUST ' +
      'be raised.', async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      const credential = credentials.clone('noProofPurpose');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofPurpose" field is invalid, an error MUST ' +
      'be raised.', async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      const credential = credentials.clone('invalidProofPurpose');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofPurpose" value does not match ' +
      '"options.expectedProofPurpose", an error MUST be raised.',
    async function() {
      this.test.cell = {columnId, rowId: this.test.title};
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
      this.test.cell = {columnId, rowId: this.test.title};
      // proofValue is added after signing so we can
      // safely delete it for this test
      const credential = credentials.clone('issuedVc');
      delete credential.proof.proofValue;
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofValue" field is invalid, an error MUST be ' +
      'raised.', async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      // null should be an invalid proofValue for almost any proof
      const credential = credentials.clone('issuedVc');
      credential.proof.proofValue = null;
      await verificationFail({credential, verifier});
    });
    it('If the "proof.created" field is invalid, an error MUST be ' +
      'raised.', async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      // FIXME: Fix test to check if a cryptographic suite requires the
      // “proof.created” value
      const credential = credentials.clone('invalidCreated');
      await verificationFail({credential, verifier});
    });
    it('If the "proof.proofValue" field is not a multibase-encoded ' +
      'base58-btc value, an error MUST be raised.', async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      const credential = credentials.clone('issuedVc');
      // remove the initial z
      credential.proof.proofValue = credential.proof.proofValue.slice(1);
      await verificationFail({credential, verifier});
    });
    it('If the "options.domain" is set and it does not match ' +
      '"proof.domain", an error MUST be raised.',
    async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      const credential = credentials.clone('invalidDomain');
      await verificationFail({
        credential, verifier, options: {
          domain: 'domain.example'
        }
      });
    });
    it('If the "options.challenge" is set and it does not match ' +
      '"proof.challenge", an error MUST be raised.', async function() {
      this.test.cell = {columnId, rowId: this.test.title};
      const credential = credentials.clone('invalidChallenge');
      await verificationFail({
        credential, verifier, options: {
          domain: 'domain.example',
          challenge: '1235abcd6789'
        }
      });
    });
  });
}

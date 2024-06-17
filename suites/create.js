/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {
  createInitialVc, dateRegex, expectedMultibasePrefix,
  isObjectOrArrayOfObjects,
  isStringOrArrayOfStrings, isValidMultibaseEncoded
} from '../helpers.js';
import chai from 'chai';
import {validVc} from '../index.js';

const should = chai.should();

export function runDataIntegrityProofFormatTests({
  endpoints, expectedCryptoSuite, expectedProofTypes, testDescription,
  vendorName
}) {
  return describe(testDescription, function() {
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
    it('The contents of the value ("proof.proofValue") MUST be expressed ' +
    'with a header and encoding as described in Section 2.4 Multibase.',
    function() {
      this.test.cell = {columnId, rowId: this.test.title};

      for(const proof of proofs) {
        const {
          prefix: expectedPrefix,
          name: encodingName
        } = expectedMultibasePrefix(proof.cryptosuite);

        proof.proofValue.slice(0, 1)
          .should.equal(
            expectedPrefix,
            `Expected "proof.proofValue" to be a ${encodingName} value`
          );

        isValidMultibaseEncoded(proof.proofValue, expectedPrefix).should
          .equal(
            true,
            `Expected "proof.proofValue" to be a valid ${encodingName} value`
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


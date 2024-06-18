/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {
  createInitialVc, dateRegex, expectedMultibasePrefix,
  isObjectOrArrayOfObjects,
  isStringOrArrayOfStrings, isValidMultibaseEncoded
} from '../helpers.js';
import chai from 'chai';
import jsonld from 'jsonld';
import {validVc} from '../index.js';

const should = chai.should();

export function runDataIntegrityProofFormatTests({
  endpoints, expectedProofTypes, testDescription,
  vendorName, cryptosuiteName
}) {
  return describe(testDescription, function() {
    const columnId = testDescription;
    beforeEach(function() {
      this.currentTest.cell = {
        columnId,
        rowId: this.currentTest.title
      };
    });
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
      should.exist(data, 'Expected data.');
      const proof = data.proof;
      should.exist(proof, 'Expected proof to exist.');
      const validType = isObjectOrArrayOfObjects(proof);
      validType.should.equal(true, 'Expected proof to be' +
        'either an object or an unordered set of objects.');
    });
    it('if "proof.id" field exists, it MUST be a valid URL.', function() {
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
      for(const proof of proofs) {
        proof.should.have.property('type');
        proof.type.should.be.a(
          'string', 'Expected "proof.type" to be a string.');
      }
    });
    it(`"proof.type" field MUST be "${expectedProofTypes.join(',')}" ` +
      `and the associated document MUST include expected contexts.`,
    function() {
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
    it('If the proof type is DataIntegrityProof, cryptosuite MUST be ' +
    'specified; otherwise, cryptosuite MAY be specified. If specified, its ' +
    'value MUST be a string.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#introduction:~:text=If%20the%20proof%20type%20is%20DataIntegrityProof%2C%20cryptosuite%20MUST%20be%20specified%3B%20otherwise%2C%20cryptosuite%20MAY%20be%20specified.%20If%20specified%2C%20its%20value%20MUST%20be%20a%20string.';
      for(const proof of proofs) {
        if(proof.type && proof.type === 'DataIntegrityProof') {
          should.exist(
            proof.cryptosuite,
            'If the proof type is DataIntegrityProof, cryptosuite MUST ' +
            'be specified');
          proof.cryptosuite.should.be.a(
            'string',
            'cryptosuite value MUST be a string.');
        }
      }
    });
    it('if "proof.created" field exists, it MUST be a valid ' +
      'XMLSCHEMA-11 dateTimeStamp value.', function() {
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
        for(const proof of proofs) {
          proof.should.have.property('proofPurpose');
          proof.proofPurpose.should.be.a('string');
        }
      });
    it('"proof.proofValue" field MUST exist and be a string.',
      function() {
        for(const proof of proofs) {
          proof.should.have.property('proofValue');
          proof.proofValue.should.be.a('string');
        }
      });
    it('The contents of the value ("proof.proofValue") MUST be expressed ' +
    'with a header and encoding as described in Section 2.4 Multibase.',
    function() {
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
        for(const proof of proofs) {
          if(proof.previousProof) {
            proof.previousProof.should.be.a('string', 'Expected ' +
              '"proof.previousProof" to be a string.');
          }
        }
      });
    it('if "proof.nonce" field exists, it MUST be a string.',
      function() {
        for(const proof of proofs) {
          if(proof.nonce) {
            proof.nonce.should.be.a('string', 'Expected "proof.nonce" ' +
              'to be a string.');
          }
        }
      });
    if(cryptosuiteName) {
      it('The value of the cryptosuite property MUST be a string that ' +
        'identifies the cryptographic suite.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#introduction:~:text=The%20value%20of%20the%20cryptosuite%20property%20MUST%20be%20a%20string%20that%20identifies%20the%20cryptographic%20suite.%20If%20the%20processing%20environment%20supports%20subtypes%20of%20string%2C%20the%20type%20of%20the%20cryptosuite%20value%20MUST%20be%20the%20https%3A//w3id.org/security%23cryptosuiteString%20subtype%20of%20string.';
        const hasCryptosuiteName = proofs.some(
          p => p?.cryptosuite === cryptosuiteName);
        hasCryptosuiteName.should.equal(
          true,
          `Expected at least one proof with cryptosuite ${cryptosuiteName}`);
      });
      it('The value of the cryptosuite property MUST be a string that ' +
        'identifies the cryptographic suite. If the processing environment ' +
        'supports subtypes of string, the type of the cryptosuite value MUST ' +
        'be the https://w3id.org/security#cryptosuiteString subtype of string.',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#introduction:~:text=The%20value%20of%20the%20cryptosuite%20property%20MUST%20be%20a%20string%20that%20identifies%20the%20cryptographic%20suite.%20If%20the%20processing%20environment%20supports%20subtypes%20of%20string%2C%20the%20type%20of%20the%20cryptosuite%20value%20MUST%20be%20the%20https%3A//w3id.org/security%23cryptosuiteString%20subtype%20of%20string.';
        const [flattened] = await jsonld.flatten(data);
        const [graph] = flattened['@graph'];
        should.exist(graph, 'Expected flattened VC to have a graph.');
        const cryptoProp = 'https://w3id.org/security#cryptosuite';
        const cryptosuite = graph[cryptoProp];
        const cryptoType = 'https://w3id.org/security#cryptosuiteString';
        should.exist(
          cryptosuite,
          `Expected graph to have property ${cryptoProp}`);
        const cryptoString = cryptosuite.some(c =>
          c?.['@type'] === cryptoType && c?.['@value'] === cryptosuiteName);
        cryptoString.should.equal(
          true,
          `Expected at least one cryptosuite with @type ${cryptoType} and ` +
          `@value ${cryptosuiteName}`);
      });
    }
  });
}


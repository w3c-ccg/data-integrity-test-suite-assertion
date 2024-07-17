/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {
  dateRegex, expectedMultibasePrefix,
  isObjectOrArrayOfObjects,
  isStringOrArrayOfStrings, isValidMultibaseEncoded,
  shouldBeUrl, shouldHaveProof, shouldMapToUrl
} from '../assertions.js';
import chai from 'chai';
import {createInitialVc} from '../helpers.js';
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
    it('When expressing a data integrity proof on an object, a proof ' +
    'property MUST be used.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#conformance:' +
      '~:text=When%20expressing%20a%20data%20integrity%20proof%20on%20an%20' +
      'object%2C%20a%20proof%20property%20MUST%20be%20used';
      shouldHaveProof({vc: data});
    });
    it('If present (proof), its value MUST be either a single object, or an ' +
    'unordered set of objects', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#conformance:' +
      '~:text=If%20present%2C%20its%20value%20MUST%20be%20either%20a%20single' +
      '%20object%2C%20or%20an%20unordered%20set%20of%20objects';
      shouldHaveProof({vc: data});
      const {proof} = data;
      const validType = isObjectOrArrayOfObjects(proof);
      validType.should.equal(true, 'Expected proof to be' +
        'either an object or an unordered set of objects.');
    });
    it('("proof.id") An optional identifier for the proof, which MUST be a ' +
    'URL.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#conformance:' +
      '~:text=An%20optional%20identifier%20for%20the%20proof%2C%20' +
      'which%20MUST%20be%20a%20URL';
      for(const proof of proofs) {
        if(proof.id) {
          shouldBeUrl({url: proof.id, prop: 'proof.id'});
        }
      }
    });
    it('The specific proof type used for the cryptographic proof MUST be ' +
        'specified as a string that maps to a URL.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:' +
      '~:text=The%20specific%20proof%20type%20used%20for%20the%20' +
      'cryptographic%20proof%20MUST%20be%20specified%20as%20a%20' +
      'string%20that%20maps%20to%20a%20URL';
      const prop = '@type';
      for(const proof of proofs) {
        proof.should.have.property('type');
        proof.type.should.be.a(
          'string', 'Expected "proof.type" to be a string.');
        const expanded = await jsonld.expand({
          '@context': data['@context'],
          type: proof.type
        });
        for(const term of expanded) {
          const types = term[prop];
          should.exist(types, 'Expected @type to exist.');
          types.every(url => shouldBeUrl({url, prop}));
        }
      }
    });
    if(expectedProofTypes.includes('DataIntegrityProof')) {
      it('The type property MUST contain the string DataIntegrityProof.',
        async function() {
          this.test.link = 'https://w3c.github.io/vc-data-integrity/' +
          '#contexts-and-vocabularies:~:text=The%20type%20property%20MUST%20' +
          'contain%20the%20string%20DataIntegrityProof.';
          for(const proof of proofs) {
            proof.should.have.property('type');
            proof.type.should.be.a(
              'string',
              'Expected "proof.type" to be a string.'
            );
            const hasExpectedType = expectedProofTypes.includes(proof.type);
            hasExpectedType.should.equal(
              true,
              `Expected "proof.type" to be one of ` +
              `${expectedProofTypes} Received: ${proof.type}`);
          }
        });
    } else {
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

          if(proof.type === 'Ed25519Signature2020') {
            const expectedContext =
              'https://w3id.org/security/suites/ed25519-2020/v1';
            const hasExpectedContext =
              data['@context'].includes(expectedContext);
            hasExpectedContext.should.equal(true);
          }
        }
      });
    }
    it('If the proof type is DataIntegrityProof, cryptosuite MUST be ' +
    'specified; otherwise, cryptosuite MAY be specified. If specified, its ' +
    'value MUST be a string.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#introduction' +
      ':~:text=If%20the%20proof%20type%20is%20DataIntegrityProof%2C%20' +
      'cryptosuite%20MUST%20be%20specified%3B%20otherwise%2C%20' +
      'cryptosuite%20MAY%20be%20specified.%20If%20specified%2C%20its%20value' +
      '%20MUST%20be%20a%20string.';
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
    it('The date and time the proof was created is OPTIONAL and, if ' +
    'included, MUST be specified as an [XMLSCHEMA11-2] dateTimeStamp ' +
    'string, either in Universal Coordinated Time (UTC), denoted by a Z at ' +
    'the end of the value, or with a time zone offset relative to UTC.',
    function() {
      for(const proof of proofs) {
        if(proof.created) {
          // check if "created" is a valid XML Schema 1.1 dateTimeStamp
          // value
          proof.created.should.match(dateRegex);
        }
      }
    });
    it('The expires property is OPTIONAL and, if present, specifies when ' +
    'the proof expires. If present, it MUST be an [XMLSCHEMA11-2] ' +
    'dateTimeStamp string, either in Universal Coordinated Time (UTC), ' +
    'denoted by a Z at the end of the value, or with a time zone offset ' +
    'relative to UTC.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:' +
      'text=MUST%20be%20an%20%5BXMLSCHEMA11%2D2%5D%20dateTimeStamp%20string%' +
      '2C%20either%20in%20Universal%20Coordinated%20Time';
      for(const proof of proofs) {
        if(proof.expires) {
          // check if "created" is a valid XML Schema 1.1 dateTimeStamp
          // value
          proof.expires.should.match(dateRegex);
        }
      }
    });
    it('A verification method is the means and information needed to verify ' +
        'the proof. If included, the value MUST be a string that maps ' +
        'to a [URL]', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:' +
      'text=A%20verification%20method%20is%20the%20means%20and%20information%' +
      '20needed%20to%20verify%20the%20proof.%20If%20included%2C%20the%20' +
      'value%20MUST%20be%20a%20string%20that%20maps%20to%20a%20%5BURL%5D.';
      for(const proof of proofs) {
        await shouldMapToUrl({
          doc: {
            '@context': data['@context'],
            ...proof
          },
          term: 'https://w3id.org/security#verificationMethod',
          prop: '@id'
        });
      }
    });
    it('The reason the proof was created ("proof.proofPurpose") MUST be ' +
        'specified as a string that maps to a URL', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:' +
      'text=The%20reason%20the%20proof%20was%20created%20MUST%20be%20' +
      'specified%20as%20a%20string%20that%20maps%20to%20a%20URL';
      for(const proof of proofs) {
        proof.should.have.property('proofPurpose');
        proof.proofPurpose.should.be.a('string');
        await shouldMapToUrl({
          doc: {
            '@context': data['@context'],
            ...proof
          },
          term: 'https://w3id.org/security#proofPurpose',
          prop: '@id'
        });
      }
    });
    it('The proofValue property MUST be used, as specified in 2.1 Proofs.',
      function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:' +
        'text=The%20proofValue%20property%20MUST%20be%20used';
        for(const proof of proofs) {
          proof.should.have.property('proofValue');
          // the rest of the proofValue is determined by the suite so just
          // assert that it is a string here.
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
        this.test.link = 'https://w3c.github.io/vc-data-integrity' +
        '/#introduction:~:text=The%20value%20of%20the%20cryptosuite%20' +
        'property%20MUST%20be%20a%20string%20that%20identifies%20the%20' +
        'cryptographic%20suite.%20If%20the%20processing%20environment%20' +
        'supports%20subtypes%20of%20string%2C%20the%20type%20of%20the%20' +
        'cryptosuite%20value%20MUST%20be%20the%20https%3A//w3id.org/' +
        'security%23cryptosuiteString%20subtype%20of%20string.';
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
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#' +
        'introduction:~:text=The%20value%20of%20the%20cryptosuite%20' +
        'property%20MUST%20be%20a%20string%20that%20identifies%20the%20' +
        'cryptographic%20suite.%20If%20the%20processing%20environment%20' +
        'supports%20subtypes%20of%20string%2C%20the%20type%20of%20the%20' +
        'cryptosuite%20value%20MUST%20be%20the%20https%3A//w3id.org/' +
        'security%23cryptosuiteString%20subtype%20of%20string.';
        const cryptoProp = 'https://w3id.org/security#cryptosuite';
        const cryptoType = 'https://w3id.org/security#cryptosuiteString';
        for(const {cryptosuite, type} of proofs) {
          should.exist(cryptosuite,
            'Expected property "proof.cryptosuite" to exist.');
          should.exist(type,
            'Expected property "proof.type" to exist.');
          should.exist(data['@context'],
            'Expected VC to have property "@context".');
          const expanded = await jsonld.expand({
            '@context': data['@context'],
            cryptosuite,
            type
          });
          for(const terms of expanded) {
            const cryptoProperties = terms[cryptoProp];
            should.exist(cryptoProperties,
              `Expected property ${cryptoProp} to exist.`);
            const hasTypeName = cryptoProperties.some(suite =>
              suite['@type'] === cryptoType &&
              suite['@value'] == cryptosuiteName);
            hasTypeName.should.equal(true,
              `Expected ${cryptoProp} with @value ${cryptosuiteName} & ` +
              `@type ${cryptoType}`);
          }
        }
      });
      describe('Algorithms', function() {
        describe('Add Proof', function() {
          it.skip('If the algorithm produces an error, the error MUST be ' +
          'propagated and SHOULD convey the error type.',
          function() {});
          it('If one or more of the proof.type, proof.verificationMethod, ' +
          'and proof.proofPurpose values is not set, an error MUST be raised ' +
          'and SHOULD convey an error type of PROOF_GENERATION_ERROR.',
          function() {
            this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:' +
            'text=If%20one%20or%20more%20of%20the%20proof.type%2C%20' +
            'proof.verificationMethod%2C%20and%20proof.proofPurpose%20' +
            'values%20is%20not%20set%2C%20an%20error%20MUST%20be%20' +
            'raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20' +
            'PROOF_GENERATION_ERROR.';
            for(const proof of proofs) {
              proof.should.have.property('type',
                'Expected proof to have type value.');
              proof.should.have.property('proofPurpose',
                'Expected proof to have proofPurpose value.');
              proof.should.have.property('verificationMethod',
                'Expected proof to have verificationMethod value.');
            }
          });
          it.skip('If options has a non-null domain item, it MUST be ' +
          'equal to proof.domain or an error MUST be raised and SHOULD ' +
          'convey an error type of PROOF_GENERATION_ERROR.',
          function() {});
          it.skip('If options has a non-null challenge item, it MUST ' +
          'be equal to proof.challenge or an error MUST be raised ' +
          'and SHOULD convey an error type of PROOF_GENERATION_ERROR.',
          function() {});
        });
        describe('Add Proof Set/Chain', function() {
          it('If a proof with id equal to previousProof does not ' +
          'exist in allProofs, an error MUST be raised and SHOULD ' +
          'convey an error type of PROOF_GENERATION_ERROR.',
          function() {
            this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=' +
            'If%20a%20proof%20with%20id%20equal%20to%20previousProofdoes%20' +
            'not%20exist%20in%20allProofs%2C%20an%20error%20MUST%20be%20' +
            'raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20' +
            'PROOF_GENERATION_ERROR.';
            for(const proof of proofs) {
              if('previousProof' in proof) {
                proofs.some(
                  otherProof => otherProof.id == proof.previousProof).
                  should.be('True',
                    'Expected previousProof value to be the id of another ' +
                  'included proof.'
                  );
              }
            }
          });
          it.skip('If any element of previousProof array has an id attribute ' +
          'that does not match the id attribute of any element of allProofs, ' +
          'an error MUST be raised and SHOULD convey an error type of ' +
          'PROOF_GENERATION_ERROR.',
          function() {
            this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:' +
            'text=If%20any%20element%20of%20previousProof%20array%20' +
            'has%20an%20id%20attribute%20that%20does%20not%20match%20' +
            'the%20id%20attribute%20of%20any%20element%20of%20allProofs%2C%20' +
            'an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20' +
            'error%20type%20of%20PROOF_GENERATION_ERROR.';
            const previousProofs = proofs.find(
              proof => proof.key === 'previousProof');
            for(const previousProof of previousProofs) {
              proofs.some(
                otherProof => otherProof.id == previousProof).
                should.be('True',
                  'Expected all previousProof values to be the id of ' +
                'another included proof.'
                );
            }
          });
        });
      });
    }
  });
}


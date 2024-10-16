/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {
  dateRegex, expectedMultibasePrefix,
  isObjectOrArrayOfObjects, isStringOrArrayOfStrings,
  shouldBeProof, shouldBeUrl,
  shouldFailIssuance, shouldHaveProof, shouldHaveProofValue, shouldMapToUrl
} from '../assertions.js';
import chai from 'chai';
import {createInitialVc} from '../helpers.js';
import {documentLoader} from '../vc-generator/documentLoader.js';
import jsonld from 'jsonld';

const should = chai.should();

export function runDataIntegrityProofFormatTests({
  endpoints, expectedProofTypes, testDescription,
  vendorName, cryptosuiteName, credential,
  optionalTests
}) {
  return describe(testDescription, function() {
    const columnId = testDescription;
    const [issuer] = endpoints;
    beforeEach(function() {
      this.currentTest.cell = {
        columnId,
        rowId: this.currentTest.title
      };
    });
    let proofs = [];
    let data;
    before(async function() {
      if(!issuer) {
        throw new Error(`Expected ${vendorName} to have an issuer.`);
      }
      if(!credential) {
        throw new Error(`Expected a credential to be passed in ` +
          `received ${credential}`);
      }
      data = await createInitialVc({issuer, credential});
      proofs = Array.isArray(data.proof) ? data.proof : [data.proof];
    });
    it('When expressing a data integrity proof on an object, a proof ' +
    'property MUST be used.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#conformance:~:text=When%20expressing%20a%20data%20integrity%20proof%20on%20an%20object%2C%20a%20proof%20property%20MUST%20be%20used';
      shouldHaveProof({vc: data});
    });
    it('If present (proof), its value MUST be either a single object, or an ' +
    'unordered set of objects.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#conformance:~:text=If%20present%2C%20its%20value%20MUST%20be%20either%20a%20single%20object%2C%20or%20an%20unordered%20set%20of%20objects';
      shouldHaveProof({vc: data});
      const {proof} = data;
      const validType = isObjectOrArrayOfObjects(proof);
      validType.should.equal(true, 'Expected proof to be' +
        'either an object or an unordered set of objects.');
    });
    it('("proof.id") An optional identifier for the proof, which MUST be a ' +
    'URL.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#conformance:~:text=An%20optional%20identifier%20for%20the%20proof%2C%20which%20MUST%20be%20a%20URL';
      for(const proof of proofs) {
        if(proof.id) {
          shouldBeUrl({url: proof.id, prop: 'proof.id'});
        }
      }
    });
    it('The specific type of proof MUST be specified as a string that maps ' +
        'to a URL.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#:~:text=The%20specific%20type%20of%20proof%20MUST%20be%20specified%20as%20a%20string%20that%20maps%20to%20a%20URL';
      const prop = '@type';
      for(const proof of proofs) {
        proof.should.have.property('type');
        proof.type.should.be.a(
          'string', 'Expected "proof.type" to be a string.');
        const expanded = await jsonld.expand({
          '@context': data['@context'],
          type: proof.type
        }, {documentLoader});
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
          this.test.link = 'https://w3c.github.io/vc-data-integrity/#contexts-and-vocabularies:~:text=The%20type%20property%20MUST%20contain%20the%20string%20DataIntegrityProof.';
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
      it('The proofValue property MUST be used, as specified in 2.1 Proofs.',
        function() {
          this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=The%20proofValue%20property%20MUST%20be%20used%2C%20as%20specified%20in%202.1%20Proofs.';
          for(const proof of proofs) {
            should.exist(proof, 'Expected proof to exist.');
            if(proof.type === 'DataIntegrityProof') {
              should.exist(proof.cryptosuite,
                'Expected proof to have property "cryptosuite".');
            }
            const {
              prefix: expectedPrefix,
              name: encodingName
            } = expectedMultibasePrefix(proof.cryptosuite);
            shouldHaveProofValue({proof, expectedPrefix, encodingName});
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
    'specified; otherwise, cryptosuite MAY be specified.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#introduction:~:text=If%20the%20proof%20type%20is%20DataIntegrityProof%2C%20cryptosuite%20MUST%20be%20specified%3B%20otherwise%2C%20cryptosuite%20MAY%20be%20specified.%20If%20specified%2C%20its%20value%20MUST%20be%20a%20string.';
      for(const proof of proofs) {
        if(proof.type && proof.type === 'DataIntegrityProof') {
          should.exist(
            proof.cryptosuite,
            'If the proof type is DataIntegrityProof, cryptosuite MUST ' +
            'be specified');
        }
      }
    });
    it('If specified (proof.cryptosuite), its value MUST be a string.',
      function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#introduction:~:text=If%20the%20proof%20type%20is%20DataIntegrityProof%2C%20cryptosuite%20MUST%20be%20specified%3B%20otherwise%2C%20cryptosuite%20MAY%20be%20specified.%20If%20specified%2C%20its%20value%20MUST%20be%20a%20string.';
        for(const proof of proofs) {
          if(proof.cryptosuite) {
            proof.cryptosuite.should.be.a(
              'string',
              'cryptosuite value MUST be a string.');
          }
        }
      });
    it('A verification method is the means and information needed to verify ' +
        'the proof. If included, the value MUST be a string that maps ' +
        'to a [URL].', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=A%20verification%20method%20is%20the%20means%20and%20information%20needed%20to%20verify%20the%20proof.%20If%20included%2C%20the%20value%20MUST%20be%20a%20string%20that%20maps%20to%20a%20%5BURL%5D.';
      for(const proof of proofs) {
        if(!data || !data?.['@context']) {
          throw new Error(`Expected ${vendorName} to issue a VC.`);
        }
        await shouldMapToUrl({
          doc: {
            '@context': data['@context'],
            ...proof
          },
          term: 'https://w3id.org/security#verificationMethod',
          prop: '@id',
          documentLoader
        });
      }
    });
    it('The reason the proof was created ("proof.proofPurpose") MUST be ' +
        'specified as a string that maps to a URL.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=The%20reason%20the%20proof%20was%20created%20MUST%20be%20specified%20as%20a%20string%20that%20maps%20to%20a%20URL';
      for(const proof of proofs) {
        proof.should.have.property('proofPurpose');
        proof.proofPurpose.should.be.a('string');
        await shouldMapToUrl({
          doc: {
            '@context': data['@context'],
            ...proof
          },
          term: 'https://w3id.org/security#proofPurpose',
          prop: '@id',
          documentLoader
        });
      }
    });
    it('("proof.proofValue") A string value that expresses base-encoded ' +
    'binary data necessary to verify the digital proof using the ' +
    'verificationMethod specified. The value MUST use a header and ' +
    'encoding as described in Section 2.4 Multibase of the Controller ' +
    'Documents 1.0 specification to express the binary data.', function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#:~:text=A%20string%20value%20that%20expresses%20base%2Dencoded%20binary%20data%20necessary%20to%20verify%20the%20digital%20proof%20using%20the%20verificationMethod%20specified.%20The%20value%20MUST%20use%20a%20header%20and%20encoding%20as%20described%20in%20Section%202.4%20Multibase%20of%20the%20Controller%20Documents%201.0%20specification%20to%20express%20the%20binary%20data.';
      for(const proof of proofs) {
        should.exist(proof, 'Expected proof to exist.');
        //FIXME the suite should pass in the expectedPrefix and
        //encodingName or type
        const {
          prefix: expectedPrefix,
          name: encodingName
        } = expectedMultibasePrefix(proof.cryptosuite);
        shouldHaveProofValue({proof, expectedPrefix, encodingName});
      }
    });
    it('Cryptographic suite designers MUST use mandatory proof value ' +
    'properties defined in Section 2.1 Proofs, and MAY define other ' +
    'properties specific to their cryptographic suite.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#add-proof:~:text=MUST%20use%20mandatory%20proof%20value%20properties%20defined';
      for(const proof of proofs) {
        shouldBeProof({proof});
      }
    });
    it('Implementations that use JSON-LD processing, such as RDF Dataset ' +
      'Canonicalization [RDF-CANON], MUST throw an error, which SHOULD be ' +
      'DATA_LOSS_DETECTION_ERROR, when data is dropped by a JSON-LD ' +
      'processor, such as when an undefined term is detected in an ' +
      'input document.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#securing-data-losslessly:~:text=Implementations%20that%20use%20JSON%2DLD%20processing%2C%20such%20as%20RDF%20Dataset%20Canonicalization%20%5BRDF%2DCANON%5D%2C%20MUST%20throw%20an%20error%2C%20which%20SHOULD%20be%20DATA_LOSS_DETECTION_ERROR%2C%20when%20data%20is%20dropped%20by%20a%20JSON%2DLD%20processor%2C%20such%20as%20when%20an%20undefined%20term%20is%20detected%20in%20an%20input%20document.';
      const undefinedType = structuredClone(credential);
      undefinedType.type.push('InvalidType');
      await shouldFailIssuance({
        credential: undefinedType,
        issuer,
        reason: 'Expected issuer to error when VC has an undefined type.'
      });
      const undefinedTerm = structuredClone(credential);
      undefinedTerm.credentialSubject.invalidTerm = 'invalidTerm';
      await shouldFailIssuance({
        credential: undefinedTerm,
        issuer,
        reason: 'Expected issuer to error when VC has an undefined term.'
      });
    });
    it('If the algorithm produces an error, the error MUST be propagated ' +
      'and SHOULD convey the error type.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#dfn-input-document:~:text=If%20the%20algorithm%20produces%20an%20error%2C%20the%20error%20MUST%20be%20propagated%20and%20SHOULD%20convey%20the%20error%20type';
      const noSubject = structuredClone(credential);
      delete noSubject.credentialSubject;
      // FIXME this test should look for a propagated error such as
      // PROOF_GENERATION_ERROR
      await shouldFailIssuance({
        credential: noSubject,
        issuer,
        reason: 'Expected issuer to error when VC has no credentialSubject.'
      });
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
          }, {documentLoader});
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
    }
    if(optionalTests.contextInjection) {
      it('When an application is securing a document, if an @context ' +
        'property is not provided in the document or the Data Integrity ' +
        'terms used in the document are not mapped by existing values in ' +
        'the @context property, implementations SHOULD inject or append an ' +
        '@context property with a value of https://w3id.org/security/data' +
        '-integrity/v2 or one or more contexts with at least the same ' +
        'declarations, such as the Verifiable Credential Data Model v2.0 ' +
        'context (https://www.w3.org/ns/credentials/v2).', async function() {
        if(!issuer) {
          throw new Error(`Expected ${vendorName} to have an issuer.`);
        }
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#context-injection:~:text=if%20an%20%40context%20property%20is%20not%20provided%20in%20the%20document%20or%20the%20Data%20Integrity%20terms%20used%20in%20the%20document%20are%20not%20mapped%20by%20existing%20values%20in%20the%20%40context%20property%2C%20implementations%20SHOULD%20inject%20or%20append';
        const _credential = structuredClone(credential);
        const expectedContexts = [
          'https://w3id.org/security/data-integrity/v2',
          'https://www.w3.org/ns/credentials/v2'
        ];
        // remove the vc's context and expect context injection to occur
        delete _credential['@context'];
        let err;
        let data;
        try {
          data = await createInitialVc({issuer, credential: _credential});
        } catch(e) {
          err = e;
        }
        should.not.exist(
          err,
          `Expected issuer ${vendorName} to perform context injection on a ` +
          `VC with out an "@context" property`);
        should.exist(data, `Expected issuer ${vendorName} to return data.`);
        data.should.be.an('object', 'Expected response data to be an object.');
        should.exist(data['@context'],
          'Expected data to have an injected "@context" property.');
        if(Array.isArray(data['@context'])) {
          const hasExpectedContext = expectedContexts.some(
            ctx => data['@context'].includes(ctx));
          return hasExpectedContext.should.equal(true,
            `Expected injected context to contain one of ${expectedContexts}`);
        }
        data['@context'].should.be.oneOf(expectedContexts);
      });
    }
    if(optionalTests.dates) {
      it('The date and time the proof was created is OPTIONAL and, if ' +
        'included, MUST be specified as an [XMLSCHEMA11-2] dateTimeStamp ' +
        'string, either in Universal Coordinated Time (UTC), denoted by a ' +
        'Z at the end of the value, or with a time zone offset relative ' +
        'to UTC.',
      function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=The%20date%20and%20time%20the%20proof%20was%20created%20is%20OPTIONAL%20and%2C%20if%20included%2C%20MUST%20be%20specified%20as%20an%20%5BXMLSCHEMA11%2D2%5D%20dateTimeStamp%20string%2C%20either%20in%20Universal%20Coordinated%20Time%20(UTC)%2C%20denoted%20by%20a%20Z%20at%20the%20end%20of%20the%20value%2C%20or%20with%20a%20time%20zone%20offset%20relative%20to%20UTC.';
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
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=MUST%20be%20an%20%5BXMLSCHEMA11%2D2%5D%20dateTimeStamp%20string%2C%20either%20in%20Universal%20Coordinated%20Time';
        for(const proof of proofs) {
          if(proof.expires) {
            // check if "created" is a valid XML Schema 1.1 dateTimeStamp
            // value
            proof.expires.should.match(dateRegex);
          }
        }
      });
    }
    if(optionalTests.domain) {
      it('The domain property is OPTIONAL. It conveys one or more security ' +
        'domains in which the proof is meant to be used. If specified, the ' +
        'associated value MUST be either a string, or an unordered set of ' +
        'strings. A verifier SHOULD use the value to ensure that the proof ' +
        'was intended to be used in the security domain in which the ' +
        'verifier is operating.', function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#verify-proof:~:text=The%20domain%20property%20is%20OPTIONAL.%20It%20conveys%20one%20or%20more%20security%20domains%20in%20which%20the%20proof%20is%20meant%20to%20be%20used.%20If%20specified%2C%20the%20associated%20value%20MUST';
        if(optionalTests.domain === false) {
          this.test.cell.skipMessage = 'Optional Test Skipped';
          this.skip();
        }
        for(const proof of proofs) {
          if(proof.domain) {
            const validType = isStringOrArrayOfStrings(proof.domain);
            validType.should.equal(true, 'Expected ' +
              '"proof.domain" to be either a string or an unordered ' +
              'set of strings.');
          }
        }
      });
      it('(challenge) A string value that SHOULD be included in a proof if a ' +
         'domain is specified.', function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#verify-proof:~:text=A%20string%20value%20that%20SHOULD%20be%20included%20in%20a%20proof%20if%20a%20domain%20is%20specified.';
        if(optionalTests.domain === false) {
          this.test.cell.skipMessage = 'Optional Test Skipped';
          this.skip();
        }
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
    }
    if(optionalTests?.proofChain) {
      it('If "proof.previousProof" property exists, it MUST be a string ' +
        'value or unordered list of string values.', function() {
        for(const proof of proofs) {
          if(proof?.previousProof) {
            isStringOrArrayOfStrings(proof.previousProof).should.equal(
              true,
              '"proof.previousProof" should be a string or an Array of strings.'
            );
          }
        }
      });
    }
  });
}


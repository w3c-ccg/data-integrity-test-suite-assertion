/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {expect} from 'chai';
import {verificationFail} from '../assertions.js';

export function runDataIntegrityProofVerifyTests({
  endpoints,
  expectedProofType,
  testDescription,
  vendorName,
  credentials,
  optionalTests
}) {
  return describe(testDescription, function() {
    const [verifier] = endpoints;
    // store the promise to avoid redudant API calls
    // for the proofValue tests
    let proofValueTests;
    if(!verifier) {
      throw new Error(`Expected ${vendorName} to have a verifier.`);
    }
    beforeEach(function() {
      this.currentTest.cell = {
        columnId: testDescription,
        rowId: this.currentTest.title
      };
    });
    before(async function() {
      proofValueTests = shouldBeProofValue({credentials, verifier});
    });
    it('Conforming processors MUST produce errors when non-conforming ' +
        'documents are consumed.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#conformance:~:text=Conforming%20processors%20MUST%20produce%20errors%20when%20non%2Dconforming%20documents%20are%20consumed.';
      // this could be read as testing all non-confirming docs or just one
      // for this test only one doc is tested as it should throw for any
      // non-conforming doc
      await verificationFail({
        credential: credentials.clone('invalidProofType'),
        verifier,
        reason: 'Should not verify VC with invalid "proof.type"'
      });
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
    it('The proofValue property MUST be used, as specified in 2.1 Proofs.',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=The%20proofValue%20property%20MUST%20be%20used%2C%20as%20specified%20in%202.1%20Proofs.';
        await proofValueTests;
      });
    it('("proof.proofValue") A string value that contains the base-encoded ' +
    'binary data necessary to verify the digital proof using the ' +
    'verificationMethod specified. The contents of the value MUST be ' +
    'expressed with a header and encoding as described in Section 2.4 ' +
    'Multibase of the Controller Documents 1.0 specification.',
    async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=string%20value%20that%20contains%20the%20base%2Dencoded%20binary%20data%20necessary%20to%20verify%20the%20digital%20proof';
      await proofValueTests;
    });
    it('Implementations that use JSON-LD processing, such as RDF Dataset ' +
      'Canonicalization [RDF-CANON], MUST throw an error, which SHOULD be ' +
      'DATA_LOSS_DETECTION_ERROR, when data is dropped by a JSON-LD ' +
      'processor, such as when an undefined term is detected in an ' +
      'input document.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#securing-data-losslessly:~:text=Implementations%20that%20use%20JSON%2DLD%20processing%2C%20such%20as%20RDF%20Dataset%20Canonicalization%20%5BRDF%2DCANON%5D%2C%20MUST%20throw%20an%20error%2C%20which%20SHOULD%20be%20DATA_LOSS_DETECTION_ERROR%2C%20when%20data%20is%20dropped%20by%20a%20JSON%2DLD%20processor%2C%20such%20as%20when%20an%20undefined%20term%20is%20detected%20in%20an%20input%20document.';
      await verificationFail({
        credential: credentials.clone('undefinedTerm'),
        verifier,
        reason: 'Should fail to verify VC when data is dropped by JSON-LD'
      });
      const undefinedTerm = credentials.clone('issuedVc');
      undefinedTerm.credentialSubject.undefinedTerm = 'IfDroppedWillVerify';
      await verificationFail({
        credential: undefinedTerm,
        verifier,
        reason: 'Should fail to verify VC if an undefined term is added ' +
          'after issuance.'
      });
      const undefinedType = credentials.clone('issuedVc');
      undefinedType.type.push('UndefinedType');
      await verificationFail({
        credential: undefinedType,
        verifier,
        reason: 'Should fail to verify VC if an undefined type is added ' +
          'after issuance.'
      });
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
    }
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
      it('If options has a non-null domain item, it MUST be equal to ' +
         'proof.domain or an error MUST be raised and SHOULD convey an ' +
          'error type of PROOF_GENERATION_ERROR.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#verify-proof:~:text=If%20options%20has%20a%20non%2Dnull%20domain%20item%2C%20it%20MUST%20be%20equal%20to%20proof.domain%20or%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR.';
        const credential = credentials.clone('invalidDomain');
        await verificationFail({
          credential, verifier, options: {
            domain: 'domain.example'
          }
        });
      });
      it('If options has a non-null challenge item, it MUST be equal to ' +
         'proof.challenge or an error MUST be raised and SHOULD convey an ' +
         'error type of PROOF_GENERATION_ERROR.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#add-proof:~:text=If%20options%20has%20a%20non%2Dnull%20challenge%20item%2C%20it%20MUST%20be%20equal%20to%20proof.challenge%20or%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR.';
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

async function shouldBeProofValue({credentials, verifier}) {
  expect(credentials, 'Expected test data to be generated.').to.exist;
  expect(credentials.clone('issuedVc'), 'Expected a valid Vc to be issued.').
    to.exist;
  // proofValue is added after signing so we can
  // safely delete it for this test
  const noProofValue = credentials.clone('issuedVc');
  delete noProofValue.proof.proofValue;
  await verificationFail({
    credential: noProofValue,
    verifier,
    reason: 'MUST not verify VC with no "proofValue".'
  });
  // null should be an invalid proofValue for almost any proof
  const nullProofValue = credentials.clone('issuedVc');
  nullProofValue.proof.proofValue = null;
  await verificationFail({
    credential: nullProofValue,
    verifier,
    reason: 'MUST not verify VC with "proofValue" null.'
  });
  const noProofValueHeader = credentials.clone('issuedVc');
  // Remove the multibase header to cause validation error
  noProofValueHeader.proof.proofValue = noProofValueHeader.proof.proofValue.
    slice(1);
  await verificationFail({
    credential: noProofValueHeader,
    verifier,
    reason: 'MUST not verify VC with invalid multibase header on "proofValue"'
  });
}

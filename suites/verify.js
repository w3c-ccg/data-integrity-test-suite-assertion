/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {
  shouldBeProofValue,
  verificationFail,
  verificationSuccess
} from '../assertions.js';

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
    it('When deserializing to RDF, implementations MUST ensure that the ' +
        'base URL is set to null.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#securing-data-losslessly:~:text=When%20deserializing%20to%20RDF%2C%20implementations%20MUST%20ensure%20that%20the%20base%20URL%20is%20set%20to%20null.';
      const credential = credentials.clone('invalidBaseUrl');
      await verificationFail({
        credential,
        verifier,
        reason: 'Should not verify VC with invalid base URL'
      });
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
    it('If either securedDocument is not a map or securedDocument.proof is ' +
      'not a map, an error MUST be raised and SHOULD convey an error type ' +
      'of PARSING_ERROR.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#:~:text=If%20either%20securedDocument%20is%20not%20a%20map%20or%20securedDocument.proof%20is%20not%20a%20map%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PARSING_ERROR.';
      const credential = credentials.clone('issuedVc');
      credential.proof = null;
      await verificationFail({
        credential,
        verifier,
        reason: 'MUST not verify VC with proof that is not a map.'
      });
      await verificationFail({
        // use a string as the non map representation of a VC
        credential: JSON.stringify(credentials.clone('issuedVc')),
        verifier,
        reason: 'MUST not verify VC that is not a map.'
      });
    });
    it('If one or more of proof.type, proof.verificationMethod, and ' +
      'proof.proofPurpose does not exist, an error MUST be raised and ' +
      'SHOULD convey an error type of PROOF_VERIFICATION_ERROR',
    async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#:~:text=If%20one%20or%20more%20of%20proof.type%2C%20proof.verificationMethod%2C%20and%20proof.proofPurpose%20does%20not%20exist%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR.';
      const credential = credentials.clone('issuedVc');
      delete credential.proof;
      await verificationFail({
        credential,
        verifier,
        reason: 'MUST not verify VC w/o a proof'
      });
      const noType = credentials.clone('issuedVc');
      delete noType.proof.type;
      await verificationFail({
        credential: noType,
        verifier,
        reason: 'MUST not verify VC w/o a "proof.type".'
      });
      const noVm = credentials.clone('noVm');
      await verificationFail({
        credential: noVm,
        verifier,
        reason: 'MUST not verify VC w/o "proof.verificationMethod"."'
      });
      const noProofPurpose = credentials.clone('noProofPurpose');
      await verificationFail({
        credential: noProofPurpose,
        verifier,
        reason: 'MUST not verify VC w/o "proof.proofPurpose"'
      });
    });
    // use updated statement for DataIntegrityProof tests
    if(expectedProofType === 'DataIntegrityProof') {
      it('The type property MUST contain the string DataIntegrityProof.',
        async function() {
          this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=The%20type%20property%20MUST%20contain%20the%20string%20DataIntegrityProof.';
          const credential = credentials.clone('invalidProofType');
          await verificationFail({
            credential,
            verifier,
            reason: 'Should not verify VC with invalid "proof.type"'
          });
        });
    } else {
      // if the expectedProofType if Ed25519Sig etc. use the
      // deprecated statement
      it(`If the "proof.type" field is not the string ` +
        `"${expectedProofType}", an error MUST be raised.`,
      async function() {
        const credential = credentials.clone('invalidProofType');
        await verificationFail({
          credential,
          verifier,
          reason: 'Should not verify VC with invalid "proof.type"'
        });
      });
    }
    it('If expectedProofPurpose was given, and it does not match ' +
        'proof.proofPurpose, an error MUST be raised and SHOULD convey an ' +
        'error type of PROOF_VERIFICATION_ERROR.', async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#:~:text=If%20expectedProofPurpose%20was%20given%2C%20and%20it%20does%20not%20match%20proof.proofPurpose%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR.';
      // NOTE: expectedProofPurpose should be specified by verifiers internally
      // it is very unlikely to be invalidProofPurpose
      await verificationFail({
        credential: credentials.clone('invalidProofPurpose'),
        verifier,
        reason: 'Verifier should reject VC with invalid proof purpose.'
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
    it('The value of the cryptosuite property MUST be a string that ' +
    'identifies the cryptographic suite. If the processing environment ' +
    'supports subtypes of string, the type of the cryptosuite value MUST ' +
    'be the https://w3id.org/security#cryptosuiteString subtype of string.',
    async function() {
      this.test.link = 'https://w3c.github.io/vc-data-integrity/#introduction:~:text=The%20value%20of%20the%20cryptosuite%20property%20MUST%20be%20a%20string%20that%20identifies%20the%20cryptographic%20suite.%20If%20the%20processing%20environment%20supports%20subtypes%20of%20string%2C%20the%20type%20of%20the%20cryptosuite%20value%20MUST%20be%20the%20https%3A//w3id.org/security%23cryptosuiteString%20subtype%20of%20string.';
      const credential = credentials.clone('invalidCryptosuite');
      await verificationFail({credential, verifier});
    });
    // for backwards compatibility in a minor release we need to support
    // all 3 optionalTests names for this section
    const {dates, created, expires} = optionalTests;
    if(dates || created || expires) {
      it('The date and time the proof was created is OPTIONAL and, if ' +
      'included, MUST be specified as an [XMLSCHEMA11-2] dateTimeStamp ' +
      'string, either in Universal Coordinated Time (UTC), denoted by a Z ' +
      'at the end of the value, or with a time zone offset relative ' +
      'to UTC.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=MUST%20be%20specified%20as%20an%20%5BXMLSCHEMA11%2D2%5D%20dateTimeStamp%20string%2C%20either%20in%20Universal%20Coordinated%20Time%20(UTC)%2C%20denoted%20by%20a%20Z%20at%20the%20end%20of%20the%20value%2C%20or%20with%20a%20time%20zone%20offset%20relative%20to%20UTC';
        await verificationFail({
          credential: credentials.clone('invalidCreated'),
          verifier
        });
      });
      it('If present (expires), it MUST be an [XMLSCHEMA11-2] dateTimeStamp ' +
      'string, either in Universal Coordinated Time (UTC), denoted by a Z ' +
      'at the end of the value, or with a time zone offset relative to UTC.',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=If%20present%2C%20it%20MUST%20be%20an%20%5BXMLSCHEMA11%2D2%5D%20dateTimeStamp%20string%2C%20either%20in%20Universal%20Coordinated%20Time%20(UTC)%2C%20denoted%20by%20a%20Z%20at%20the%20end%20of%20the%20value%2C%20or%20with%20a%20time%20zone%20offset%20relative%20to%20UTC.';
        await verificationFail({
          credential: credentials.clone('invalidExpires'),
          verifier
        });
      });
      // we can't tell if its interpreted correctly but we can ensure their
      // verifier at least takes timestamps without Z or an offset.
      it('(created) A conforming processor MAY chose to consume time values ' +
      'that were incorrectly serialized without an offset.', async function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#proofs:~:text=be%20a%20string.-,created,-The%20date%20and';
        await verificationSuccess({
          credential: credentials.clone('noOffsetCreated'),
          verifier
        });
      });
      it('(expires) A conforming processor MAY chose to consume time values ' +
      'that were incorrectly serialized without an offset.', async function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#proofs:~:text=interpreted%20as%20UTC.-,expires,-The%20expires%20property';
        await verificationSuccess({
          credential: credentials.clone('noOffsetExpires'),
          verifier
        });
      });
    }
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
    if(optionalTests.proofChain) {
      it('An OPTIONAL string value (proof.previousProof) or unordered list ' +
      'of string values. Each value identifies another data integrity proof ' +
      'that MUST verify before the current proof is processed.',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=An%20OPTIONAL%20string%20value%20or%20unordered%20list%20of%20string%20values.%20Each%20value%20identifies%20another%20data%20integrity%20proof%20that%20MUST%20verify%20before%20the%20current%20proof%20is%20processed';
        await verificationSuccess({
          credential: credentials.clone('previousProofString'),
          verifier,
          reason: 'Should verify VC with a string "proof.previousProof".'
        });
        await verificationSuccess({
          credential: credentials.clone('previousProofArray'),
          verifier,
          reason: 'Should verify VC with an Array "proof.previousProof".'
        });
      });
      it('If an unordered list (proof), all referenced proofs in ' +
      'the array MUST verify.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#proofs:~:text=If%20an%20unordered%20list%2C%20all%20referenced%20proofs%20in%20the%20array%20MUST%20verify';
        await verificationSuccess({
          credential: credentials.clone('proofSet'),
          verifier,
          reason: 'Should verify VC with multiple proofs.'
        });
      });
      it('If a proof with id equal to previousProof does not exist in ' +
      'allProofs, an error MUST be raised and SHOULD convey an error type ' +
      'of PROOF_VERIFICATION_ERROR.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#:~:text=If%20a%20proof%20with%20id%20equal%20to%20previousProof%20does%20not%20exist%20in%20allProofs%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR';
        await verificationFail({
          credential: credentials.clone('missingPreviousProofString'),
          verifier,
          reason: 'Should not verify VC with invalid "proof.previousProof".'
        });
      });
      it('If any element of previousProof list has an id attribute that ' +
      'does not match the id attribute of any element of allProofs, an ' +
      'error MUST be raised and SHOULD convey an error type of ' +
      'PROOF_VERIFICATION_ERROR.', async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#:~:text=If%20any%20element%20of%20previousProof%20list%20has%20an%20id%20attribute%20that%20does%20not%20match%20the%20id%20attribute%20of%20any%20element%20of%20allProofs%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR.';
        await verificationFail({
          credential: credentials.clone('missingPreviousProofArray'),
          verifier,
          reason: 'Should not verify VC with invalid "proof.previousProof".'
        });
      });
      it('Each value identifies another data integrity proof, all of which ' +
      'MUST also verify for the current proof to be considered verified',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-data-integrity/#:~:text=Each%20value%20identifies%20another%20data%20integrity%20proof%2C%20all%20of%20which%20MUST%20also%20verify%20for%20the%20current%20proof%20to%20be%20considered%20verified';
        await verificationFail({
          credential: credentials.clone('previousProofFail'),
          verifier,
          reason: 'Should not verify VC with a "previousProof" that does ' +
          'not verify.'
        });

      });
    }
  });
}

/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import chai from 'chai';
import {createInitialVc} from '../helpers.js';

const expect = chai.expect;

export function algorithmsSuite({
  endpoints,
  testDescription = 'Data Integrity - Algorithms',
  vendorName,
  credential,
  features = {
    authentication: false,
    proofChain: false
  }
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
    it('Whenever this algorithm encodes strings, it MUST use UTF-8 encoding.',
      function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=or%20an%20error.-,Whenever%20this%20algorithm%20encodes%20strings%2C%20it%20MUST%20use%20UTF%2D8%20encoding.,-Let%20proof%20be';
        for(const proof of proofs) {
          expect(proof.proofValue.isWellFormed()).to.be.true;
        }
      });
    it('If the algorithm produces an error, the error MUST be propagated \
and SHOULD convey the error type.',
    function() {
      this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=If%20the%20algorithm%20produces%20an%20error%2C%20the%20error%20MUST%20be%20propagated%20and%20SHOULD%20convey%20the%20error%20type.';
      this.test.cell.skipMessage = 'Pending test.';
      this.skip();
    });
    it('If one or more of the proof.type, proof.verificationMethod, \
and proof.proofPurpose values is not set, an error MUST be raised.',
    function() {
      this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=If%20one%20or%20more%20of%20the%20proof.type%2C%20proof.verificationMethod%2C%20and%20proof.proofPurpose%20values%20is%20not%20set%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR.';
      for(const proof of proofs) {
        expect(proof).to.contain.keys(
          'type', 'proofPurpose', 'verificationMethod');
      }
    });
    if(features?.authentication) {
      it('If options has a non-null domain item, it MUST be equal to \
  proof.domain or an error MUST be raised.',
      function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=If%20options%20has%20a%20non%2Dnull%20domain%20item%2C%20it%20MUST%20be%20equal%20to%20proof.domain%20or%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR.';
        this.test.cell.skipMessage = 'Pending test.';
        this.skip();
      });
      it('If options has a non-null challenge item, it MUST be equal to \
  proof.challenge or an error MUST be raised.',
      function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=If%20options%20has%20a%20non%2Dnull%20challenge%20item%2C%20it%20MUST%20be%20equal%20to%20proof.challenge%20or%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR.';
        this.test.cell.skipMessage = 'Pending test.';
        this.skip();
      });
    }
    if(features?.proofChain) {
      it('If a proof with id equal to previousProof does not exist in ' +
        'allProofs, an error MUST be raised.', function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=If%20a%20proof%20with%20id%20equal%20to%20previousProofdoes%20not%20exist%20in%20allProofs%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR.';
        for(const proof of proofs) {
          if('previousProof' in proof) {
            if(typeof proof.previousProof === 'string') {
              proofs.some(
                otherProof => otherProof.id == proof.previousProof).
                should.equal(true,
                  'Expected previousProof ' +
                      `${proof.previousProof} ` +
                      'to be the id of another included proof.'
                );
            } if(Array.isArray(proof.previousProof)) {
              for(const previousProof in proof.previousProof) {
                proofs.some(
                  otherProof => otherProof.id == previousProof).
                  should.equal(true,
                    'Expected previousProof ' +
                          `${proof.previousProof} ` +
                          'to be the id of another included proof.'
                  );
              }
            }
          }
        }
      });
      it('If any element of previousProof array has an id attribute' +
        ' that does not match the id attribute of any element of allProofs,' +
        ' an error MUST be raised.', function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#:~:text=If%20any%20element%20of%20previousProof%20array%20has%20an%20id%20attribute%20that%20does%20not%20match%20the%20id%20attribute%20of%20any%20element%20of%20allProofs%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR.';
        const previousProofs = [];
        for(const proof of proofs) {
          if('previousProof' in proof) {
            if(typeof proof.previousProof === 'string') {
              previousProofs.push(proof.previousProof);
            } if(Array.isArray(proof.previousProof)) {
              previousProofs.concat(proof.previousProof);
            }
          }
        }
        for(const previousProof of previousProofs) {
          proofs.some(
            otherProof => otherProof.id == previousProof).should.equal(
            true,
            'Expected all previousProof values to be the id of \
  another included proof.'
          );
        }
      });
    }
  });
}

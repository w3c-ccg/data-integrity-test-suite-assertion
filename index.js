/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
import {createInitialVc} from './helpers.js';
import {validVc} from './validVc.js';

const should = chai.should();

/**
 * Validates the structure of the "proof" property on a digital document.
 *
 * @param {object} options - Options to use.
 * @param {Map<string,object>} options.implemented - The vendors being tested.
 * @param {Map<string,object>} options.notImplemented - The vendors not being
 *   tested.
 * @returns {object} Returns the test suite being run.
 */
export function checkDataIntegrityProofFormat({
  implemented,
  notImplemented,
} = {}) {
  return describe('Data Integrity (issuer)', function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.implemented = [...implemented.keys()];
    this.notImplemented = [...notImplemented.keys()];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Issuer';
    for(const [vendorName, {endpoints}] of implemented) {
      if(!endpoints) {
        throw new Error(`Expected ${vendorName} to have endpoints.`);
      }
      describe(vendorName, function() {
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
        it('`proof` field MUST exist at top-level of data object.', function() {
          this.test.cell = {columnId: vendorName, rowId: this.test.title};
          should.exist(data, 'Expected data.');
          should.exist(data.proof, 'Expected proof to be top-level');
          const type = typeof data.proof;
          type.should.be.oneOf(
            ['object', 'array'],
            'Expected proof to be either an object or an array.'
          );
        });
        it('`type` field MUST exist and be a string.', function() {
          this.test.cell = {columnId: vendorName, rowId: this.test.title};
          for(const proof of proofs) {
            proof.should.have.property('type');
            proof.type.should.be.a('string');
          }
        });
        it('`type` field MUST be `DataIntegrityProof`.', function() {
          this.test.cell = {columnId: vendorName, rowId: this.test.title};
          for(const proof of proofs) {
            proof.should.have.property('type');
            proof.type.should.be.a(
              'string',
              'Expected `proof.type` to be a string.'
            );
            proof.type.should.equal('DataIntegrityProof');
          }
        });
        it('`created` field MUST exist and be a valid XMLSCHEMA-11 datetime' +
            'value.', function() {
          this.test.cell = {columnId: vendorName, rowId: this.test.title};
          for(const proof of proofs) {
            proof.should.have.property('created');
            // check if "created" is a valid ISO 8601 datetime value
            const dateRegex = new RegExp('^(\\d{4})-(0[1-9]|1[0-2])-' +
            '(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):' +
            '([0-5][0-9]):([0-5][0-9]|60)' +
            '(\\.[0-9]+)?(Z|(\\+|-)([01][0-9]|2[0-3]):' +
            '([0-5][0-9]))$', 'i');
            proof.created.should.match(dateRegex);
          }
        });
        it('`verificationMethod` field MUST exist and be a valid URL.',
          function() {
            this.test.cell = {columnId: vendorName, rowId: this.test.title};
            for(const proof of proofs) {
              proof.should.have.property('verificationMethod');
              let result;
              let err;
              try {
                result = new URL(proof.verificationMethod);
              } catch(e) {
                err = e;
              }
              should.not.exist(err, 'Expected verificationMethod to be a URL');
              should.exist(result, 'Expected verificationMethod to be a URL');
            }
          });
        it('`proofPurpose` field MUST exist and be a string.', function() {
          this.test.cell = {columnId: vendorName, rowId: this.test.title};
          for(const proof of proofs) {
            proof.should.have.property('proofPurpose');
            proof.proofPurpose.should.be.a('string');
          }
        });
        it('`proofValue` field MUST exist and be a string', function() {
          this.test.cell = {columnId: vendorName, rowId: this.test.title};
          for(const proof of proofs) {
            proof.should.have.property('proofValue');
            proof.proofValue.should.be.a('string');
          }
        });
      });
    } // end for loop
  }); // end describe
}

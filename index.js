/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');

const should = chai.should();

/**
 * The vendor being tested.
 *
 * @typedef {object} vendor
 * @property {Function<Promise|object>} getData - A function that returns a
 * digital document with a "proof" property on it.
 * @property {string} vendorName - The name of the vendor who issued the
 *   document.
 */

/**
 * Validates the structure of the "proof" property on a digital document.
 *
 * @param {object} options - Options to use.
 * @param {Array<vendor>} options.vendors - The vendors being tested.
 *
 * @returns {undefined} Just returns on success.
 */
function checkDataIntegrityProofFormat({vendors = []} = {}) {
  describe('Data Integrity', function() {
    // column names for the matrix go here
    const columnNames = [];
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.columns = columnNames;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Issuer';
    for(const {getData, vendorName} of vendors) {
      if(!(getData && typeof getData === 'function')) {
        throw new Error('"getData" function is required.');
      }
      if(!(vendorName && typeof vendorName === 'string')) {
        throw new Error('"vendorName" string is required.');
      }
      columnNames.push(vendorName);
      let proofs = [];
      let data;
      before(async function() {
        data = await getData();
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
    } // end for loop
  }); // end describe
}

exports.checkDataIntegrityProofFormat = checkDataIntegrityProofFormat;

/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');

const should = chai.should();

/**
 * Validates the structure of the "proof" property on a digital document.
 *
 * @param {object} data - A digital document with "proof" property on it.
 * @param {string} vendor - The name of the vendor who issued the document.
 *
 * @returns {undefined} Just returns on success.
 */
function checkDataIntergrity(data, vendor) {
  describe('Data Integrity', function() {
    const {proof} = data;
    it('"proof" field MUST exist at top-level of data object.', function() {
      this.test.cell = {columnId: vendor, rowId: this.test.title};
      should.exist(proof);
      const type = typeof proof;
      type.should.be.oneOf(['object', 'array']);
    });
    if(proof) {
      if(Array.isArray(proof)) {
        proof.forEach(p => {
          checkProof(p, vendor);
        });
      } else {
        checkProof(proof, vendor);
      }
    }
  });
}

function checkProof(proof, vendor) {
  it('"type" field MUST exist and be a string.', function() {
    this.test.cell = {columnId: vendor, rowId: this.test.title};
    proof.should.have.property('type');
    proof.type.should.be.a('string');
  });
  it('"created" field MUST exist and be a valid XMLSCHEMA-11 datetime value.',
    function() {
      this.test.cell = {columnId: vendor, rowId: this.test.title};
      proof.should.have.property('created');
      // check if "created" is a valid ISO 8601 datetime value
      const dateRegex = new RegExp('^(\\d{4})-(0[1-9]|1[0-2])-' +
      '(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):' +
      '([0-5][0-9]):([0-5][0-9]|60)' +
      '(\\.[0-9]+)?(Z|(\\+|-)([01][0-9]|2[0-3]):' +
      '([0-5][0-9]))$', 'i');
      proof.created.should.match(dateRegex);
    });
  it('"verificationMethod" field MUST exist and be a valid URL.',
    function() {
      this.test.cell = {columnId: vendor, rowId: this.test.title};
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
    });
  it('"proofPurpose" field MUST exist and be a string.', function() {
    this.test.cell = {columnId: vendor, rowId: this.test.title};
    proof.should.have.property('proofPurpose');
    proof.proofPurpose.should.be.a('string');
  });
  it('"proofValue" field MUST exist and be a string', function() {
    this.test.cell = {columnId: vendor, rowId: this.test.title};
    proof.should.have.property('proofValue');
    proof.proofValue.should.be.a('string');
  });
}

module.exports = {
  checkDataIntergrity
};

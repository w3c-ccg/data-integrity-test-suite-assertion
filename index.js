/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');

const should = chai.should();

function checkDataIntergrity(data) {
  describe('Data Integrity', function() {
    const {proof} = data;
    it('"proof" field MUST exist at top-level of data object.', async () => {
      should.exist(proof);
      if(!(typeof proof === 'object' || Array.isArray(proof))) {
        throw new Error('"proof" MUST be an object or an array of objects.');
      }
    });
    if(proof) {
      if(Array.isArray(proof)) {
        proof.forEach(p => {
          checkProof(p);
        });
      } else {
        checkProof(proof);
      }
    }
  });
}

function checkProof(proof) {
  it('"type" field MUST exist and be a string.', async () => {
    proof.should.have.property('type');
    proof.type.should.be.a('string');
  });
  it('"created" field MUST exist and be a valid XMLSCHEMA-11 datetime value.',
    async () => {
      proof.should.have.property('created');
      // check if "created" is a valid ISO 8601 datetime value
      const dateRegex = new RegExp('^(\\d{4})-(0[1-9]|1[0-2])-' +
      '(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):' +
      '([0-5][0-9]):([0-5][0-9]|60)' +
      '(\\.[0-9]+)?(Z|(\\+|-)([01][0-9]|2[0-3]):' +
      '([0-5][0-9]))$', 'i');
      const valid = dateRegex.test(proof.created);
      valid.should.equal(true);
    });
  it('"verificationMethod" field MUST exist and be a valid URL.',
    async () => {
      proof.should.have.property('verificationMethod');
      // Is verificationMethod always a string URL? and does it always start
      // with https/http? or also did:key/did:v1?
    });
  it('"proofPurpose" field MUST exist and be a string.', async () => {
    proof.should.have.property('proofPurpose');
    proof.proofPurpose.should.be.a('string');
  });
  it('"proofValue" field MUST exist and be a string', async () => {
    proof.should.have.property('proofValue');
    proof.proofValue.should.be.a('string');
  });
}

module.exports = {
  checkDataIntergrity
};

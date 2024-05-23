/*!
 * Copyright 2023-24 Digital Bazaar, Inc. All Rights Reserved
 */

export function invalidCreateProof({
  addCreated = true,
  addVm = true,
  addType = true,
  addProofPurpose = true,
  mockPurpose
}) {
  return async function({
    document,
    purpose,
    proofSet,
    documentLoader
  }) {
    // build proof (currently known as `signature options` in spec)
    let proof;
    if(this.proof) {
      // shallow copy
      proof = {...this.proof};
    } else {
      // create proof JSON-LD document
      proof = {};
    }
    if(addType) {
      // ensure proof type is set
      proof.type = this.type;
    }

    if(addCreated) {
    // set default `now` date if not given in `proof` or `options`
      let date = this.date;
      if(proof.created === undefined && date === undefined) {
        date = new Date();
      }
      // ensure date is in string format
      if(date && (date instanceof Date)) {
        // replace ms block with Z for seconds precision
        date = date.toISOString().replace(/\.\d+Z$/, 'Z');
      }
      // add API overrides
      if(date) {
        proof.created = date;
      }
    }

    if(addVm) {
      proof.verificationMethod = this.verificationMethod;
    }
    proof.cryptosuite = this.cryptosuite;
    // add any extensions to proof (mostly for legacy support)
    proof = await this.updateProof({
      document, proof, purpose, documentLoader
    });
    if(addProofPurpose) {
      if(mockPurpose) {
        proof.proofPurpose = mockPurpose;
      } else {
      // allow purpose to update the proof; the `proof` is in the
      // SECURITY_CONTEXT_URL `@context` -- therefore the `purpose` must
      // ensure any added fields are also represented in that same `@context`
        proof = await purpose.update(
          proof, {document, suite: this, documentLoader});
      }
    }

    // create data to sign
    let verifyData;
    // use custom cryptosuite `createVerifyData` if available
    if(this._cryptosuite.createVerifyData) {
      verifyData = await this._cryptosuite.createVerifyData({
        cryptosuite: this._cryptosuite,
        document, proof, proofSet, documentLoader,
        dataIntegrityProof: this
      });
    } else {
      verifyData = await this.createVerifyData(
        {document, proof, proofSet, documentLoader});
    }

    // use custom `createProofValue` if available
    if(this._cryptosuite.createProofValue) {
      proof.proofValue = await this._cryptosuite.createProofValue({
        cryptosuite: this._cryptosuite,
        verifyData, document, proof, proofSet,
        documentLoader, dataIntegrityProof: this
      });
    } else {
      // default to simple signing of data
      proof = await this.sign(
        {verifyData, document, proof, proofSet, documentLoader});
    }

    return proof;
  };
}

/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {decodeSecretKeySeed} from 'bnid';

export const getMultikey = async ({seedMultibase}) => {
  if(!seedMultibase) {
    throw new Error('seedMultibase required');
  }
  // convert multibase seed to Uint8Array
  const seed = decodeSecretKeySeed({secretKeySeed: seedMultibase});
  const key = await Ed25519Multikey.generate({seed});
  const signer = key.signer();
  // The issuer needs to match the signer or the controller of the signer
  const issuer = `did:key:${key.publicKeyMultibase}`;
  // verificationMethod needs to be a fragment
  // this only works for did:key
  signer.id = `${issuer}#${key.publicKeyMultibase}`;
  return {signer, issuer};
};

export function invalidCreateProof({
  addCreated = true,
  addVm = true,
  addProofPurpose = true,
  mockPurpose
}) {
  return async function({
    document,
    purpose,
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
    // ensure proof type is set
    proof.type = this.type;

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
    const verifyData = await this.createVerifyData({
      document, proof, documentLoader
    });

    // sign data
    proof = await this.sign(
      {verifyData, document, proof, documentLoader});

    return proof;
  };
}

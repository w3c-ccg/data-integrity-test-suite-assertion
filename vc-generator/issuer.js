/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 */
import * as vc from '@digitalbazaar/vc';
import {documentLoader} from './documentLoader.js';
import jsigs from 'jsonld-signatures';

const {CredentialIssuancePurpose} = vc;

/**
 * Issues a cloned credential, if a selectiveSuite is passed in
 * the derived VC is returned.
 *
 * @param {object} options - Options to use.
 * @param {object} options.suite - A DataIntegrityProof.
 * @param {object} [options.selectiveSuite] - A D.I. Proof for a selective
 *   suite.
 * @param {object} options.credential - A credential to be signed.
 * @param {Function} [options.loader = documentLoader] - A documentLoader.
 * @param {object} [options.purpose = new CredentialIssuancePurpose()] - A
 *   purpose.
 *
 * @returns {Promise<object>} - An issued VC.
 */
export async function issueCloned({
  suite, selectiveSuite, credential, loader = documentLoader,
  purpose = new CredentialIssuancePurpose(),
}) {
  const verifiableCredential = await vc.issue({
    credential: structuredClone(credential),
    suite,
    documentLoader: loader,
    purpose
  });
  if(!selectiveSuite) {
    return verifiableCredential;
  }
  return jsigs.derive(verifiableCredential, {
    documentLoader: loader,
    purpose,
    suite: selectiveSuite
  });
}

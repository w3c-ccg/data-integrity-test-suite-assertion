/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import * as vc from '@digitalbazaar/vc';
import {documentLoader} from './documentLoader.js';
import {invalidCreateProof} from './helpers.js';
import jsigs from 'jsonld-signatures';
import {klona} from 'klona';

const {AuthenticationProofPurpose} = jsigs.purposes;
const {CredentialIssuancePurpose} = vc;

export const vcGenerators = new Map([
  ['issuedVc', _issuedVc],
  ['invalidDomain', _invalidDomain],
  ['invalidChallenge', _invalidChallenge],
  ['invalidProofType', _incorrectProofType],
  ['noCreated', _noCreated],
  ['invalidCreated', _invalidCreated],
  ['vcCreatedOneYearAgo', _vcCreatedOneYearAgo],
  ['noVm', _noVm],
  ['invalidVm', _invalidVm],
  ['noProofPurpose', _noProofPurpose],
  ['invalidProofPurpose', _invalidProofPurpose]
]);

async function _invalidProofPurpose({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({mockPurpose: 'invalidPurpose'});
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _invalidDomain({suite, selectiveSuite, credential}) {
  const domain = 'invalid-vc-domain.example.com';
  const challenge = '1235abcd6789';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return _issueCloned({suite, selectiveSuite, credential, purpose});
}

async function _invalidChallenge({suite, selectiveSuite, credential}) {
  const domain = 'domain.example';
  const challenge = 'invalid-challenge';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return _issueCloned({suite, selectiveSuite, credential, purpose});
}

async function _noProofPurpose({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _invalidVm({suite, selectiveSuite, credential}) {
  suite.verificationMethod = 'did:key:invalidVm';
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _noVm({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addVm: false});
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _invalidCreated({suite, selectiveSuite, credential}) {
  // FIXME does this actually sign with an invalid created?
  suite.date = 'invalidDate';
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _vcCreatedOneYearAgo({suite, selectiveSuite, credential}) {
  // intentionally set the created date to be a year ago
  const created = new Date();
  created.setDate(created.getDate() - 365);
  suite.date = created.toISOString().replace(/\.\d+Z$/, 'Z');
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _noCreated({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addCreated: false});
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _incorrectProofType({suite, selectiveSuite, credential}) {
  suite.type = 'UnknownProofType';
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _issuedVc({suite, selectiveSuite, credential}) {
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _issueCloned({
  suite, selectiveSuite, credential, loader = documentLoader,
  purpose = new CredentialIssuancePurpose(),
}) {
  const verifiableCredential = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader: loader,
    purpose
  });
  if(!selectiveSuite) {
    return verifiableCredential;
  }
  return _deriveCloned({
    selectiveSuite, verifiableCredential,
    loader: documentLoader, purpose
  });
}

async function _deriveCloned({
  selectiveSuite, verifiableCredential, loader = documentLoader,
  purpose = new CredentialIssuancePurpose(),
}) {
  return vc.derive({
    verifiableCredential: klona(verifiableCredential),
    suite: selectiveSuite,
    documentLoader: loader,
    purpose
  });
}

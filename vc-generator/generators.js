/*!
 * Copyright 2023-24 Digital Bazaar, Inc. All Rights Reserved
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
  ['invalidProofType', _invalidProofType],
  ['noCreated', _noCreated],
  ['invalidCreated', _invalidCreated],
  ['vcCreatedOneYearAgo', _vcCreatedOneYearAgo],
  ['noVm', _noVm],
  ['invalidVm', _invalidVm],
  ['noProofPurpose', _noProofPurpose],
  ['invalidProofPurpose', _invalidProofPurpose]
]);

// derived VCs don't work as proof purpose mismatch
async function _invalidProofPurpose({suite, credential}) {
  suite.createProof = invalidCreateProof({mockPurpose: 'invalidPurpose'});
  return _issueCloned({suite, credential});
}

// derived VCs don't work as proof purpose mismatch
async function _invalidDomain({suite, credential}) {
  const domain = 'invalid-vc-domain.example.com';
  const challenge = '1235abcd6789';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return _issueCloned({suite, credential, purpose});
}

// derived VCs don't work as proof purpose mismatch
async function _invalidChallenge({suite, credential}) {
  const domain = 'domain.example';
  const challenge = 'invalid-challenge';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return _issueCloned({suite, credential, purpose});
}

// derived VCs don't work as proof purpose mismatch
async function _noProofPurpose({suite, credential}) {
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  const vc = await _issueCloned({suite, credential});
  return vc;
}

// both base and derived VCs will have an invalid verificationMethod
async function _invalidVm({suite, selectiveSuite, credential}) {
  suite.verificationMethod = 'did:key:invalidVm';
  return _issueCloned({suite, selectiveSuite, credential});
}

//both base and derived VCs will lack a verificationMethod
async function _noVm({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addVm: false});
  return _issueCloned({suite, selectiveSuite, credential});
}

//FIXME BBS suite does not use created
//both base and derived work with this
async function _invalidCreated({suite, selectiveSuite, credential}) {
  // suite.date will be used as created when signing
  suite.date = 'invalidDate';
  return _issueCloned({suite, selectiveSuite, credential});
}
//FIXME BBS suite does not use created
async function _vcCreatedOneYearAgo({suite, selectiveSuite, credential}) {
  // intentionally set the created date to be a year ago
  const created = new Date();
  created.setDate(created.getDate() - 365);
  suite.date = created.toISOString().replace(/\.\d+Z$/, 'Z');
  return _issueCloned({suite, selectiveSuite, credential});
}

//FIXME this is irrelevant for BBS
async function _noCreated({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addCreated: false});
  return _issueCloned({suite, selectiveSuite, credential});
}

// both base and derived will have an invalid proof.type
async function _invalidProofType({suite, selectiveSuite, credential}) {
  suite.type = 'UnknownProofType';
  if(selectiveSuite) {
    const proofId = 'urn:uuid:no-proof-type-test';
    suite.proof = {id: proofId};
    selectiveSuite._cryptosuite.options.proofId = proofId;
  }
  return _issueCloned({suite, selectiveSuite, credential});
}

// issues both a base and derived vc
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
}) {
  return vc.derive({
    verifiableCredential,
    suite: selectiveSuite,
    documentLoader: loader
  });
}

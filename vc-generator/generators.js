/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import * as vc from '@digitalbazaar/vc';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from './documentLoader.js';
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
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

async function _invalidProofPurpose({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({mockPurpose: 'invalidPurpose'});
  return _issueCloned({suite, credential});
}

async function _invalidDomain({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  const domain = 'invalid-vc-domain.example.com';
  const challenge = '1235abcd6789';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return _issueCloned({suite, credential, purpose});
}

async function _invalidChallenge({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  const domain = 'domain.example';
  const challenge = 'invalid-challenge';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return _issueCloned({suite, credential, purpose});
}

async function _noProofPurpose({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  return _issueCloned({suite, credential});
}

async function _invalidVm({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.verificationMethod = 'did:key:invalidVm';
  return _issueCloned({suite, credential});
}

async function _noVm({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addVm: false});
  return _issueCloned({suite, credential});
}

async function _invalidCreated({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.date = 'invalidDate';
  return _issueCloned({suite, credential});
}

async function _vcCreatedOneYearAgo({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  // intentionally set the created date to be a year ago
  const created = new Date();
  created.setDate(created.getDate() - 365);
  suite.date = created.toISOString().replace(/\.\d+Z$/, 'Z');
  return _issueCloned({suite, credential});
}

async function _noCreated({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addCreated: false});
  return _issueCloned({suite, credential});
}

async function _incorrectProofType({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.type = 'UnknownProofType';
  return _issueCloned({suite, credential});
}

async function _issuedVc({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  return _issueCloned({suite, credential});
}

function _createEddsa2022Suite({signer}) {
  // remove milliseconds precision
  const date = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const cryptosuite = eddsa2022CryptoSuite;
  return new DataIntegrityProof({signer, date, cryptosuite});
}

async function _issueCloned({
  suite, credential, loader = documentLoader,
  purpose = new CredentialIssuancePurpose(),
}) {
  return vc.issue({
    credential: klona(credential),
    suite,
    documentLoader: loader,
    purpose
  });
}
